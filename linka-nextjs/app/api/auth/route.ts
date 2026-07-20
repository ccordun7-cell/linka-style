import { NextRequest, NextResponse } from 'next/server'
import { createToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 15

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

async function verifyRecaptcha(token: string, ip: string): Promise<boolean> {
  try {
    const formData = new URLSearchParams()
    formData.append('secret', process.env.RECAPTCHA_SECRET_KEY!)
    formData.append('response', token)
    if (ip !== 'unknown') formData.append('remoteip', ip)

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  // Verifica numarul de incercari recente de pe aceasta adresa IP
  const { count, error: countError } = await supabaseAdmin
    .from('login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('attempted_at', windowStart)

  // Daca tabelul nu exista inca (migrarea 005 nu a fost rulata), nu blocam
  // login-ul din cauza asta - doar sarim peste limitare pentru aceasta cerere
  if (!countError && (count ?? 0) >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: `Prea multe încercări. Încearcă din nou peste ${WINDOW_MINUTES} minute.` },
      { status: 429 }
    )
  }

  const { password, recaptchaToken } = await req.json()

  if (!recaptchaToken) {
    return NextResponse.json({ error: 'Verificare reCAPTCHA lipsă' }, { status: 400 })
  }

  const recaptchaOk = await verifyRecaptcha(recaptchaToken, ip)
  if (!recaptchaOk) {
    return NextResponse.json({ error: 'Verificare reCAPTCHA eșuată. Reîncearcă.' }, { status: 400 })
  }

  // Inregistram incercarea INAINTE de a verifica parola, ca sa numaram
  // si incercarile esuate (asta e tot rostul limitarii). Nu blocam login-ul
  // daca insert-ul esueaza (ex. tabelul nu exista inca).
  await supabaseAdmin.from('login_attempts').insert({ ip }).then(() => {}, () => {})

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Parolă incorectă' }, { status: 401 })
  }

  const token = await createToken()
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 zile
    path: '/'
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}

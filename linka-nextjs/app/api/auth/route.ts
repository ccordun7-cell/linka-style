import { NextRequest, NextResponse } from 'next/server'
import { createToken } from '@/lib/auth'

async function verifyTurnstile(token: string, ip: string | null) {
  try {
    const formData = new URLSearchParams()
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY!)
    formData.append('response', token)
    if (ip) formData.append('remoteip', ip)

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
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
  const { password, turnstileToken } = await req.json()

  if (!turnstileToken) {
    return NextResponse.json({ error: 'Verificare de securitate lipsa' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
  const turnstileOk = await verifyTurnstile(turnstileToken, ip)
  if (!turnstileOk) {
    return NextResponse.json({ error: 'Verificare de securitate esuata. Reincarca pagina si incearca din nou.' }, { status: 400 })
  }

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

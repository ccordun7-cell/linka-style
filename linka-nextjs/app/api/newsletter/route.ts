import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 30
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

// GET - toti abonatii (admin)
export async function GET(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST - abonare noua (public)
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  const { count, error: countError } = await supabaseAdmin
    .from('newsletter_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('attempted_at', windowStart)

  if (!countError && (count ?? 0) >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Prea multe incercari. Mai incearca putin mai tarziu.' }, { status: 429, headers: corsHeaders })
  }

  await supabaseAdmin.from('newsletter_attempts').insert({ ip }).then(() => {}, () => {})

  const { email, source } = await req.json()
  if (!email || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Adresa de email nu este valida.' }, { status: 400, headers: corsHeaders })
  }

  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .insert({ email: email.trim().toLowerCase(), source: source || 'footer' })

  if (error) {
    // Emailul e deja abonat (constrangere UNIQUE) - tratam ca succes, nu ca eroare
    if (error.code === '23505') {
      return NextResponse.json({ success: true, already: true }, { headers: corsHeaders })
    }
    return NextResponse.json({ error: 'Eroare la abonare: ' + error.message }, { status: 500, headers: corsHeaders })
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders })
}

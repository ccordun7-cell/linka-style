import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'

// GET - toate codurile promo (admin)
export async function GET() {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST - cod promo nou (admin). Simplu: doar procent de reducere, la cererea clientei.
export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { code, discount_value, usage_limit, expires_at } = await req.json()

  if (!code || !code.trim()) {
    return NextResponse.json({ error: 'Codul promo este obligatoriu' }, { status: 400 })
  }
  const percent = parseFloat(discount_value)
  if (!percent || percent <= 0 || percent >= 100) {
    return NextResponse.json({ error: 'Procentul de reducere trebuie sa fie intre 1 si 99' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('promo_codes')
    .insert({
      code: code.trim().toUpperCase(),
      discount_type: 'percent',
      discount_value: percent,
      usage_limit: usage_limit ? parseInt(usage_limit) : null,
      expires_at: expires_at || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Acest cod promo exista deja' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

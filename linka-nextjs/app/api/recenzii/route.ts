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

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

// GET - daca esti admin (autentificat), toate recenziile (pentru moderare).
// Altfel (public, de pe site), doar recenziile aprobate pentru un produs
// anume (?product_id=...).
export async function GET(req: NextRequest) {
  const authed = await isAuthenticated()
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')

  if (authed) {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (!productId) {
    return NextResponse.json({ error: 'product_id este obligatoriu' }, { status: 400, headers: corsHeaders })
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('id, customer_name, rating, comment, created_at')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  return NextResponse.json(data, { headers: corsHeaders })
}

// POST - recenzie noua (public). Intra "in asteptare" pana e aprobata din admin.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  const { count, error: countError } = await supabaseAdmin
    .from('review_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('attempted_at', windowStart)

  if (!countError && (count ?? 0) >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Prea multe recenzii trimise. Mai incearca putin mai tarziu.' }, { status: 429, headers: corsHeaders })
  }

  await supabaseAdmin.from('review_attempts').insert({ ip }).then(() => {}, () => {})

  const { product_id, customer_name, rating, comment } = await req.json()

  if (!product_id || !customer_name || !customer_name.trim() || !rating) {
    return NextResponse.json({ error: 'Numele si nota (stele) sunt obligatorii.' }, { status: 400, headers: corsHeaders })
  }
  const ratingNum = parseInt(rating)
  if (ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: 'Nota trebuie sa fie intre 1 si 5 stele.' }, { status: 400, headers: corsHeaders })
  }

  const { error } = await supabaseAdmin
    .from('reviews')
    .insert({ product_id, customer_name: customer_name.trim(), rating: ratingNum, comment: comment ? comment.trim() : null })

  if (error) return NextResponse.json({ error: 'Eroare la salvare: ' + error.message }, { status: 500, headers: corsHeaders })

  return NextResponse.json({ success: true }, { headers: corsHeaders })
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { uploadBannerImage } from '@/lib/cloudinary'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// GET - daca esti admin, toate bannerele (pentru gestionare). Altfel
// (public, de pe site), doar cele active, in ordine.
export async function GET() {
  const authed = await isAuthenticated()

  let query = supabaseAdmin.from('banners').select('*').order('sort_order', { ascending: true })
  if (!authed) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  return NextResponse.json(data, { headers: corsHeaders })
}

// POST - banner nou (admin). Imaginea vine ca base64, se urca pe Cloudinary
// cu decupaj lat (1600x600), potrivit pentru carusel.
export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { image, title, cta_text, cta_link, sort_order } = await req.json()

  if (!image) {
    return NextResponse.json({ error: 'Imaginea este obligatorie' }, { status: 400 })
  }

  let uploaded
  try {
    uploaded = await uploadBannerImage(image)
  } catch (e: any) {
    return NextResponse.json({ error: 'Eroare la incarcarea imaginii: ' + e.message }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin
    .from('banners')
    .insert({
      image_url: uploaded.url,
      cloudinary_id: uploaded.cloudinary_id,
      title: title || null,
      cta_text: cta_text || null,
      cta_link: cta_link || null,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

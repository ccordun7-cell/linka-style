import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - toate produsele (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const brand = searchParams.get('brand')
  const search = searchParams.get('search')

  let query = supabase.from('products_full').select('*').order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (brand) query = query.eq('brand_slug', brand)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Genereaza un slug simplu dintr-un text (nume brand, nume produs etc)
function slugify(text: string) {
  return text.toLowerCase()
    .replace(/[ăâ]/g, 'a').replace(/[îí]/g, 'i')
    .replace(/[șş]/g, 's').replace(/[țţ]/g, 't')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Gaseste brandul dupa nume (case-insensitive) sau il creeaza daca nu exista
async function findOrCreateBrand(brandName: string): Promise<string> {
  const cleanName = brandName.trim()
  const slug = slugify(cleanName)

  const { data: existing } = await supabaseAdmin
    .from('brands')
    .select('id')
    .ilike('name', cleanName)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await supabaseAdmin
    .from('brands')
    .insert({ slug, name: cleanName })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return created.id
}

// POST - adaugă produs nou (admin only)
export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await req.json()
  const { name, brand_name, type, category, price, description, is_barefoot, sizes, images } = body

  if (!brand_name || !brand_name.trim()) {
    return NextResponse.json({ error: 'Numele brandului este obligatoriu' }, { status: 400 })
  }

  let brand_id: string
  try {
    brand_id = await findOrCreateBrand(brand_name)
  } catch (e: any) {
    return NextResponse.json({ error: 'Eroare la brand: ' + e.message }, { status: 500 })
  }

  // Generez slug
  const slug = slugify(name) + '-' + Date.now()

  // Inserez produsul
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert({ slug, name, brand_id, type, category, price, description, is_barefoot })
    .select()
    .single()

  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 })

  // Upload imagini pe Cloudinary
  if (images?.length) {
    for (let i = 0; i < images.length; i++) {
      const { url, cloudinary_id } = await uploadImage(images[i])
      await supabaseAdmin.from('product_images').insert({
        product_id: product.id, url, cloudinary_id, position: i
      })
    }
  }

  // Inserez mărimile
  if (sizes?.length) {
    await supabaseAdmin.from('product_sizes').insert(
      sizes.map((s: { size: number; price: number; stock: number }) => ({
        product_id: product.id,
        size: s.size,
        price: s.price || price,
        stock_quantity: s.stock || 10
      }))
    )
  }

  return NextResponse.json({ success: true, product })
}

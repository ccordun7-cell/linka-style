import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { findOrCreateBrand } from '@/lib/brands'

export async function GET() {
  const { data } = await supabase.from('brands').select('*').order('name')
  return NextResponse.json(data || [])
}

// POST - creeaza un brand nou direct, fara sa fie nevoie de un produs
export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { name } = await req.json()
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Numele brandului este obligatoriu' }, { status: 400 })
  }

  try {
    const id = await findOrCreateBrand(name)
    return NextResponse.json({ success: true, id })
  } catch (e: any) {
    return NextResponse.json({ error: 'Eroare la crearea brandului: ' + e.message }, { status: 500 })
  }
}

// DELETE - sterge un brand, dar DOAR daca nu are niciun produs asociat (siguranta)
export async function DELETE(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Lipseste id-ul brandului' }, { status: 400 })

  const { count, error: countError } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', id)

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

  if (count && count > 0) {
    return NextResponse.json({
      error: `Nu pot sterge brandul: are ${count} produs${count === 1 ? '' : 'e'} asociat${count === 1 ? '' : 'e'}. Muta sau sterge intai produsele.`
    }, { status: 409 })
  }

  const { error } = await supabaseAdmin.from('brands').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

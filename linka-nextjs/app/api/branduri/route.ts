import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  const { data } = await supabase.from('brands').select('*').order('name')
  return NextResponse.json(data || [])
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

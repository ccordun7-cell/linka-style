import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { deleteImage } from '@/lib/cloudinary'

// PUT - actualizeaza un banner (titlu, buton, link, ordine, activ/inactiv)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params
  const { title, cta_text, cta_link, sort_order, is_active } = await req.json()

  const updatePayload: Record<string, unknown> = {}
  if (title !== undefined) updatePayload.title = title
  if (cta_text !== undefined) updatePayload.cta_text = cta_text
  if (cta_link !== undefined) updatePayload.cta_link = cta_link
  if (sort_order !== undefined) updatePayload.sort_order = sort_order
  if (typeof is_active === 'boolean') updatePayload.is_active = is_active

  const { error } = await supabaseAdmin.from('banners').update(updatePayload).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE - sterge un banner (si poza de pe Cloudinary)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params

  const { data: banner } = await supabaseAdmin.from('banners').select('cloudinary_id').eq('id', id).single()
  if (banner?.cloudinary_id) await deleteImage(banner.cloudinary_id)

  const { error } = await supabaseAdmin.from('banners').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

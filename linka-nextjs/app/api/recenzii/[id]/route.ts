import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'

// PUT - aproba/respinge o recenzie
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params
  const { is_approved } = await req.json()

  const { error } = await supabaseAdmin.from('reviews').update({ is_approved: !!is_approved }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE - sterge o recenzie
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

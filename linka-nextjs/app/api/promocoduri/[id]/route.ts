import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'

// PUT - actualizeaza un cod promo existent (ex: activeaza/dezactiveaza)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params
  const { is_active, discount_value } = await req.json()

  const updatePayload: Record<string, unknown> = {}
  if (typeof is_active === 'boolean') updatePayload.is_active = is_active
  if (discount_value !== undefined) updatePayload.discount_value = parseFloat(discount_value)

  const { error } = await supabaseAdmin.from('promo_codes').update(updatePayload).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE - sterge un cod promo
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin.from('promo_codes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

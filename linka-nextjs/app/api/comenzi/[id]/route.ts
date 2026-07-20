import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params
  const { status, notes } = await req.json()
  await supabaseAdmin.from('orders').update({ status, notes }).eq('id', id)
  return NextResponse.json({ success: true })
}

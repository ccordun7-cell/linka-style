import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase.from('brands').select('*').order('name')
  return NextResponse.json(data || [])
}

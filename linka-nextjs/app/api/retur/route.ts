import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { sendReturnRequestNotificationToAdmin, sendReturnRequestConfirmationToClient } from '@/lib/email'

// Cererea de retur e publica prin design (orice client poate solicita un retur),
// asa ca permitem cereri de pe orice origine — inclusiv linkastyle.com.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

const MAX_RETURN_ATTEMPTS = 5
const RETURN_WINDOW_MINUTES = 30

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

// GET - toate cererile de retur (admin)
export async function GET(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('return_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST - cerere noua de retur (public)
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const windowStart = new Date(Date.now() - RETURN_WINDOW_MINUTES * 60 * 1000).toISOString()

  const { count, error: countError } = await supabaseAdmin
    .from('return_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('attempted_at', windowStart)

  if (!countError && (count ?? 0) >= MAX_RETURN_ATTEMPTS) {
    return NextResponse.json(
      { error: `Prea multe cereri de retur de pe aceasta adresa. Incearca din nou peste ${RETURN_WINDOW_MINUTES} minute, sau suna-ne direct.` },
      { status: 429, headers: corsHeaders }
    )
  }

  await supabaseAdmin.from('return_attempts').insert({ ip }).then(() => {}, () => {})

  const body = await req.json()
  const { order_number, customer_name, customer_phone, customer_email, reason, refund_method, bank_details } = body

  if (!order_number || !customer_name || !customer_phone || !reason) {
    return NextResponse.json({ error: 'Numarul comenzii, numele, telefonul si motivul sunt obligatorii.' }, { status: 400, headers: corsHeaders })
  }

  const { data, error } = await supabaseAdmin
    .from('return_requests')
    .insert({ order_number, customer_name, customer_phone, customer_email, reason, refund_method, bank_details })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Eroare la salvarea cererii: ' + error.message }, { status: 500, headers: corsHeaders })
  }

  try {
    await sendReturnRequestNotificationToAdmin(data)
    await sendReturnRequestConfirmationToClient(data)
  } catch (e) {
    console.error('Eroare trimitere notificari retur:', e)
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders })
}

// PUT - actualizeaza statusul unei cereri (admin)
export async function PUT(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Lipseste id sau status' }, { status: 400 })

  const { error } = await supabaseAdmin.from('return_requests').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

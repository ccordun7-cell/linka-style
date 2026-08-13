import { NextRequest, NextResponse } from 'next/server'
import { validatePromoCode } from '@/lib/promo'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// POST - valideaza un cod promo pentru afisare live la checkout (public).
// Reducerea finala e oricum re-verificata din nou pe server, la /api/comenzi,
// cand se plaseaza efectiv comanda — asta e doar pentru feedback imediat.
export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()

  if (!code || typeof subtotal !== 'number') {
    return NextResponse.json({ valid: false, error: 'Date invalide' }, { status: 400, headers: corsHeaders })
  }

  const result = await validatePromoCode(code, subtotal)
  return NextResponse.json(result, { headers: corsHeaders })
}

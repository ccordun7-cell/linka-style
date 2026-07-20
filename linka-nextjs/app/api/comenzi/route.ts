import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { sendOrderConfirmationToClient, sendOrderNotificationToAdmin } from '@/lib/email'
import { validatePromoCode, incrementPromoUsage } from '@/lib/promo'

// Comanda e publica prin design (oricine poate comanda), asa ca permitem
// cereri de pe orice origine — inclusiv site-ul static linkastyle.com de pe Netlify.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// GET - toate comenzile (admin)
export async function GET(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('orders_with_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST - comandă nouă (public)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customer_name, customer_phone, customer_email, delivery_address, delivery_city, payment_method, items, promo_code } = body

  if (!customer_name || !customer_phone || !items?.length) {
    return NextResponse.json({ error: 'Date incomplete' }, { status: 400, headers: corsHeaders })
  }

  // SECURITATE: nu am incredere in pret/nume/brand trimise de client — le recalculez
  // din baza de date, dupa product_id + size. Altfel oricine ar putea comanda
  // un produs de 2000 MDL la pretul de 1 MDL, editand cererea din browser.
  const productIds = Array.from(new Set(items.map((i: any) => i.product_id)))
  const { data: sizeRows, error: sizesError } = await supabaseAdmin
    .from('product_sizes')
    .select('product_id, size, price, stock_quantity, products(name, name_ru, is_active, brands(name))')
    .in('product_id', productIds)

  if (sizesError) return NextResponse.json({ error: 'Eroare la verificarea produselor: ' + sizesError.message }, { status: 500, headers: corsHeaders })

  const verifiedItems: any[] = []
  for (const item of items) {
    const match = (sizeRows || []).find((r: any) => r.product_id === item.product_id && r.size === item.size)
    if (!match) {
      return NextResponse.json({ error: `Produsul comandat (mărime ${item.size}) nu mai există sau a fost modificat. Reîmprospătează pagina și încearcă din nou.` }, { status: 400, headers: corsHeaders })
    }
    const product: any = Array.isArray(match.products) ? match.products[0] : match.products
    if (!product || product.is_active === false) {
      return NextResponse.json({ error: 'Unul dintre produsele comandate nu mai este disponibil.' }, { status: 400, headers: corsHeaders })
    }
    const quantity = Math.max(1, parseInt(item.quantity) || 1)
    if (match.stock_quantity < quantity) {
      return NextResponse.json({ error: `Stoc insuficient pentru mărimea ${item.size}. Mai sunt disponibile: ${match.stock_quantity}.` }, { status: 400, headers: corsHeaders })
    }
    const brand: any = Array.isArray(product.brands) ? product.brands[0] : product.brands
    verifiedItems.push({
      product_id: item.product_id,
      product_name: product.name,
      product_brand: brand ? brand.name : '',
      size: item.size,
      price: match.price, // pretul real, din baza de date — niciodata cel trimis de client
      quantity
    })
  }

  const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const delivery_cost = subtotal >= 1000 ? 0 : 80

  // Revalidez codul promo pe server (nu am incredere in reducerea trimisa de client)
  let discount_amount = 0
  let appliedPromoCode: string | null = null
  if (promo_code) {
    const promoResult = await validatePromoCode(promo_code, subtotal)
    if (promoResult.valid) {
      discount_amount = promoResult.discount_amount || 0
      appliedPromoCode = promoResult.code || null
    }
  }

  const total = Math.max(0, subtotal - discount_amount) + delivery_cost

  // Inserez comanda
  const { data: order, error } = await supabaseAdmin.from('orders').insert({
    customer_name, customer_phone, customer_email,
    delivery_address, delivery_city: delivery_city || 'Chișinău',
    payment_method: payment_method || 'ramburs',
    total, delivery_cost, status: 'noua',
    promo_code: appliedPromoCode, discount_amount
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })

  if (appliedPromoCode) await incrementPromoUsage(appliedPromoCode)

  // Inserez produsele din comandă (cu preturile verificate, nu cele trimise de client)
  await supabaseAdmin.from('order_items').insert(
    verifiedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_brand: item.product_brand,
      size: item.size,
      price: item.price,
      quantity: item.quantity
    }))
  )

  // Trimit notificări
  const fullOrder = { ...order, items: verifiedItems }
  try {
    await sendOrderNotificationToAdmin(fullOrder)
    if (customer_email) await sendOrderConfirmationToClient(fullOrder)
  } catch (e) {
    console.error('Eroare trimitere notificări:', e)
  }

  return NextResponse.json({ success: true, order_number: order.order_number, discount_amount, total }, { headers: corsHeaders })
}

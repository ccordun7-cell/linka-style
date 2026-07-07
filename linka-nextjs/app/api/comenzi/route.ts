import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { sendOrderConfirmationToClient, sendOrderNotificationToAdmin } from '@/lib/email'

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
  const { customer_name, customer_phone, customer_email, delivery_address, delivery_city, payment_method, items } = body

  if (!customer_name || !customer_phone || !items?.length) {
    return NextResponse.json({ error: 'Date incomplete' }, { status: 400, headers: corsHeaders })
  }

  const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
  const delivery_cost = total >= 1000 ? 0 : 80

  // Inserez comanda
  const { data: order, error } = await supabaseAdmin.from('orders').insert({
    customer_name, customer_phone, customer_email,
    delivery_address, delivery_city: delivery_city || 'Chișinău',
    payment_method: payment_method || 'ramburs',
    total, delivery_cost, status: 'noua'
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })

  // Inserez produsele din comandă
  await supabaseAdmin.from('order_items').insert(
    items.map((item: any) => ({
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
  const fullOrder = { ...order, items }
  try {
    await sendOrderNotificationToAdmin(fullOrder)
    if (customer_email) await sendOrderConfirmationToClient(fullOrder)
  } catch (e) {
    console.error('Eroare trimitere notificări:', e)
  }

  return NextResponse.json({ success: true, order_number: order.order_number }, { headers: corsHeaders })
}

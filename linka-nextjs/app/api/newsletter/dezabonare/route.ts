import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { getUnsubscribeToken } from '@/lib/email'

// Endpoint public — accesat direct din linkul "Dezabonează-te" din emailurile
// trimise prin newsletter. Sterge definitiv adresa din newsletter_subscribers,
// asa ca dispare automat si din lista din admin.

function htmlPage(title: string, message: string) {
  return `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: -apple-system, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; color: #33475b; padding: 0 24px; }
  h1 { color: #1B2E4B; font-size: 22px; }
  p { font-size: 15px; line-height: 1.6; }
  a { color: #4AADE8; text-decoration: none; font-weight: 600; }
</style></head>
<body><h1>${title}</h1><p>${message}</p><p><a href="https://linkastyle.com">← Înapoi la Linka Style</a></p></body></html>`
}

function htmlResponse(title: string, message: string, status: number) {
  return new NextResponse(htmlPage(title, message), {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = (searchParams.get('email') || '').trim().toLowerCase()
  const token = searchParams.get('token') || ''

  if (!email || !token) {
    return htmlResponse('Link invalid', 'Linkul de dezabonare nu este valid.', 400)
  }

  const expected = getUnsubscribeToken(email)
  const tokenBuf = Buffer.from(token)
  const expectedBuf = Buffer.from(expected)
  const valid = tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)

  if (!valid) {
    return htmlResponse('Link invalid', 'Linkul de dezabonare nu este valid sau a expirat.', 400)
  }

  await supabaseAdmin.from('newsletter_subscribers').delete().eq('email', email)

  return htmlResponse(
    'Dezabonare reușită',
    `Adresa <strong>${email}</strong> a fost eliminată din lista noastră de newsletter. Nu vei mai primi emailuri de la noi.`,
    200
  )
}

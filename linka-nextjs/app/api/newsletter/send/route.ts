import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { sendNewsletterBlast } from '@/lib/email'

export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { subject, message } = await req.json()
  if (!subject || !subject.trim() || !message || !message.trim()) {
    return NextResponse.json({ error: 'Subiectul si mesajul sunt obligatorii.' }, { status: 400 })
  }

  const { data: subscribers, error } = await supabaseAdmin.from('newsletter_subscribers').select('email')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ error: 'Nu exista niciun abonat inca.' }, { status: 400 })
  }

  try {
    const result = await sendNewsletterBlast(subject.trim(), message.trim(), subscribers.map(s => s.email))
    return NextResponse.json({ success: true, sent: result.sent })
  } catch (e: any) {
    const sgDetails = e?.response?.body?.errors?.map((err: any) => err.message).join('; ')
    return NextResponse.json({ error: 'Eroare la trimitere: ' + (sgDetails || e.message) }, { status: 500 })
  }
}

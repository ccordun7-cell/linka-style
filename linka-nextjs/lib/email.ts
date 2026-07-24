import sgMail from '@sendgrid/mail'
import { Order, ReturnRequest } from '@/types'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const SENDER_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'ccordun7@gmail.com'
const REPLY_TO_EMAIL = process.env.SENDGRID_REPLY_TO || 'mobilife16@gmail.com'

export async function sendOrderConfirmationToClient(order: Order) {
  const itemsHtml = order.items?.map(item =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.product_brand} — ${item.product_name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">EU ${item.size}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.price} MDL</td>
    </tr>`
  ).join('')

  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY lipsește — email de confirmare comandă nu a fost trimis.')
    return
  }

  await sgMail.send({
    from: { email: SENDER_EMAIL, name: 'Linka Style' },
    replyTo: REPLY_TO_EMAIL,
    to: order.customer_email,
    subject: `✅ Comanda #${order.order_number} confirmată — Linka Style`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#4AADE8;padding:24px;text-align:center">
          <h1 style="color:white;margin:0">Linka Style</h1>
        </div>
        <div style="padding:24px">
          <h2>Mulțumim pentru comandă, ${order.customer_name}!</h2>
          <p>Comanda ta <strong>#${order.order_number}</strong> a fost primită și va fi procesată în curând.</p>
          <p>Te vom contacta la <strong>${order.customer_phone}</strong> pentru confirmare.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Produs</th>
                <th style="padding:8px;text-align:center">Mărime</th>
                <th style="padding:8px;text-align:right">Preț</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align:right;font-size:18px;font-weight:bold">
            Total: ${order.total} MDL
          </div>
          <p style="margin-top:20px;color:#666">
            🚚 Livrare: ${order.delivery_cost === 0 ? 'GRATUITĂ' : order.delivery_cost + ' MDL'}<br>
            📍 Adresă: ${order.delivery_address || 'Neindicată'}, ${order.delivery_city}<br>
            💳 Plată: ${order.payment_method}
          </p>
          <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-top:20px">
            <p style="margin:0;color:#666;font-size:13px">
              Garanție 365 zile · Returnare 14 zile · Probă acasă<br>
              Întrebări? Scrie-ne: <a href="mailto:info@linkastyle.md">info@linkastyle.md</a>
            </p>
          </div>
        </div>
      </div>
    `
  })
}

export async function sendOrderNotificationToAdmin(order: Order) {
  const itemsList = order.items?.map(item =>
    `• ${item.product_brand} — ${item.product_name} / EU ${item.size} / ${item.price} MDL`
  ).join('\n')

  // Telegram
  const msg = `🛒 *COMANDĂ NOUĂ #${order.order_number} — Linka Style*\n\n` +
    `👤 *Client:* ${order.customer_name}\n` +
    `📞 *Telefon:* ${order.customer_phone}\n` +
    `📍 *Adresă:* ${order.delivery_address || 'Neindicată'}, ${order.delivery_city}\n` +
    `✉️ *Email:* ${order.customer_email || 'Neindicat'}\n\n` +
    `*Produse:*\n${itemsList}\n\n` +
    `💰 *Total: ${order.total} MDL*\n` +
    `🚚 *Livrare:* ${order.delivery_cost === 0 ? 'GRATUITĂ' : order.delivery_cost + ' MDL'}\n` +
    `🕐 *Ora:* ${new Date().toLocaleString('ro-MD')}`

  const chatIds = process.env.TELEGRAM_CHAT_IDS?.split(',') || []
  await Promise.all(chatIds.map(chatId =>
    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId.trim(), text: msg, parse_mode: 'Markdown' })
    })
  ))
}

export async function sendReturnRequestNotificationToAdmin(req: ReturnRequest) {
  const msg = `🔄 *CERERE DE RETUR — Linka Style*\n\n` +
    `📦 *Comanda:* #${req.order_number}\n` +
    `👤 *Client:* ${req.customer_name}\n` +
    `📞 *Telefon:* ${req.customer_phone}\n` +
    `✉️ *Email:* ${req.customer_email || 'Neindicat'}\n\n` +
    `📝 *Motiv:* ${req.reason}\n` +
    `💳 *Metoda rambursare:* ${req.refund_method || 'Neindicata'}\n` +
    (req.bank_details ? `🏦 *Detalii cont:* ${req.bank_details}\n` : '') +
    `\n🕐 *Ora:* ${new Date().toLocaleString('ro-MD')}`

  const chatIds = process.env.TELEGRAM_CHAT_IDS?.split(',') || []
  await Promise.all(chatIds.map(chatId =>
    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId.trim(), text: msg, parse_mode: 'Markdown' })
    })
  ))
}

export async function sendNewsletterBlast(subject: string, message: string, recipients: string[]) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY lipsește — nu se poate trimite.')
  }
  if (!recipients.length) return { sent: 0 }

  // Fiecare destinatar isi vede doar propria adresa (personalizations separate),
  // nu o lista comuna vizibila tuturor.
  const messageHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#4AADE8;padding:24px;text-align:center">
        <h1 style="color:white;margin:0">Linka Style</h1>
      </div>
      <div style="padding:24px">
        ${message.split('\n').map(line => `<p style="margin:0 0 12px;color:#33475b;font-size:15px;line-height:1.6">${line}</p>`).join('')}
        <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-top:24px">
          <p style="margin:0;color:#666;font-size:12px">
            Primești acest email pentru că ești abonat la newsletter-ul Linka Style.<br>
            Întrebări? Scrie-ne: <a href="mailto:info@linkastyle.com">info@linkastyle.com</a>
          </p>
        </div>
      </div>
    </div>
  `

  // SendGrid accepta pana la 1000 de personalizations intr-un singur apel
  const BATCH_SIZE = 900
  let sent = 0
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    await sgMail.send({
      from: { email: SENDER_EMAIL, name: 'Linka Style' },
      replyTo: REPLY_TO_EMAIL,
      subject,
      html: messageHtml,
      personalizations: batch.map(email => ({ to: [{ email }] }))
    } as any)
    sent += batch.length
  }
  return { sent }
}

export async function sendReturnRequestConfirmationToClient(req: ReturnRequest) {
  if (!req.customer_email || !process.env.SENDGRID_API_KEY) return

  await sgMail.send({
    from: { email: SENDER_EMAIL, name: 'Linka Style' },
    replyTo: REPLY_TO_EMAIL,
    to: req.customer_email,
    subject: `Am primit cererea ta de retur pentru comanda #${req.order_number} — Linka Style`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#4AADE8;padding:24px;text-align:center">
          <h1 style="color:white;margin:0">Linka Style</h1>
        </div>
        <div style="padding:24px">
          <h2>Am primit cererea ta de retur, ${req.customer_name}!</h2>
          <p>Pentru comanda <strong>#${req.order_number}</strong>, motiv: ${req.reason}.</p>
          <p>Te vom contacta la <strong>${req.customer_phone}</strong> în cel mai scurt timp, cu pașii următori.</p>
          <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-top:20px">
            <p style="margin:0;color:#666;font-size:13px">
              Întrebări? Sună la 061 299 950 sau scrie-ne: <a href="mailto:info@linkastyle.com">info@linkastyle.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  })
}

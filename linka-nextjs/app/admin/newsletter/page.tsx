'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface Subscriber {
  id: string
  email: string
  source: string
  created_at: string
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState('')
  const [sendError, setSendError] = useState('')

  const loadSubscribers = async () => {
    const res = await fetch('/api/newsletter')
    const data = await res.json()
    setSubscribers(data || [])
    setLoading(false)
  }

  useEffect(() => { loadSubscribers() }, [])

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Ștergi definitiv ${email} din lista de newsletter?`)) return
    const res = await fetch('/api/newsletter', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) setSubscribers(prev => prev.filter(s => s.id !== id))
    else alert('Eroare la ștergere.')
  }

  const copyAllEmails = () => {
    const emails = subscribers.map(s => s.email).join(', ')
    navigator.clipboard.writeText(emails)
    alert(`${subscribers.length} adrese copiate!`)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    if (!confirm(`Sigur trimiți acest mesaj la ${subscribers.length} abonați? Nu poate fi anulat.`)) return

    setSending(true)
    setSendResult('')
    setSendError('')
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSendError(data.error || 'Eroare la trimitere.')
        return
      }
      setSendResult(`Trimis cu succes la ${data.sent} abonați!`)
      setSubject('')
      setMessage('')
    } catch {
      setSendError('Eroare de conexiune. Incearca din nou.')
    } finally {
      setSending(false)
    }
  }

  return (
    <AdminLayout title="Newsletter">
      <div className="admin-card" style={{marginBottom:'20px'}}>
        <h3 style={{fontSize:'15px',fontWeight:800,marginBottom:'6px'}}>Trimite mesaj la toți abonații</h3>
        <p style={{fontSize:'13px',color:'#6B7A90',marginBottom:'16px'}}>
          Un promo cod, o ofertă, o veste — scrii ce vrei, se trimite pe email la toată lista ({subscribers.length} abonați). Fiecare primește un email separat, nu văd adresele celorlalți.
        </p>
        <form onSubmit={handleSend}>
          <div className="form-group" style={{marginBottom:'12px'}}>
            <label>Subiect</label>
            <input className="form-control" value={subject} onChange={e => setSubject(e.target.value)} placeholder="ex: -20% la toată colecția de toamnă" required />
          </div>
          <div className="form-group" style={{marginBottom:'12px'}}>
            <label>Mesaj</label>
            <textarea className="form-control" value={message} onChange={e => setMessage(e.target.value)} rows={6}
              placeholder="Scrie mesajul aici — fiecare paragraf nou apare pe rândul lui în email." required />
          </div>
          {sendError && <p style={{color:'#c62828',fontSize:'13px',marginBottom:'10px'}}>{sendError}</p>}
          {sendResult && <p style={{color:'#1A8A50',fontSize:'13px',marginBottom:'10px'}}>{sendResult}</p>}
          <button className="btn-primary" type="submit" disabled={sending || subscribers.length === 0}>
            {sending ? 'Se trimite...' : `Trimite la ${subscribers.length} abonați`}
          </button>
        </form>
      </div>

      <p style={{fontSize:'13px',color:'#6B7A90',marginBottom:'16px'}}>
        Adresele colectate din formularul de newsletter de pe site (footer + popup).
      </p>

      {subscribers.length > 0 && (
        <button className="btn-secondary" style={{marginBottom:'16px'}} onClick={copyAllEmails}>
          Copiaza toate adresele ({subscribers.length})
        </button>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{textAlign:'center',padding:'40px'}}>Se incarca...</div>
        ) : subscribers.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'#6B7A90'}}>Niciun abonat inca.</div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #f0f4f8'}}>
                {['Email','Sursa','Data',''].map(h => (
                  <th key={h} style={{padding:'10px',textAlign:'left',fontSize:'12px',color:'#6B7A90',fontWeight:700,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id} style={{borderBottom:'1px solid #f0f4f8'}}>
                  <td style={{padding:'10px',fontSize:'13px',fontWeight:600}}>{s.email}</td>
                  <td style={{padding:'10px',fontSize:'12px',color:'#6B7A90'}}>{s.source}</td>
                  <td style={{padding:'10px',fontSize:'12px',color:'#6B7A90'}}>{new Date(s.created_at).toLocaleDateString('ro-MD')}</td>
                  <td style={{padding:'10px',textAlign:'right'}}>
                    <button onClick={() => handleDelete(s.id, s.email)} style={{background:'none',border:'none',color:'#c62828',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>Șterge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

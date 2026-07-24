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

  const loadSubscribers = async () => {
    const res = await fetch('/api/newsletter')
    const data = await res.json()
    setSubscribers(data || [])
    setLoading(false)
  }

  useEffect(() => { loadSubscribers() }, [])

  const copyAllEmails = () => {
    const emails = subscribers.map(s => s.email).join(', ')
    navigator.clipboard.writeText(emails)
    alert(`${subscribers.length} adrese copiate!`)
  }

  return (
    <AdminLayout title="Newsletter">
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
                {['Email','Sursa','Data'].map(h => (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

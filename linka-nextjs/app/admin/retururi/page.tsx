'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { ReturnRequest } from '@/types'

const statusOptions = [
  { value: 'noua', label: '🔔 Noua', color: '#fff9c4' },
  { value: 'in_procesare', label: '⏳ In procesare', color: '#fff3e0' },
  { value: 'finalizata', label: '✅ Finalizata', color: '#e8f5e9' },
  { value: 'respinsa', label: '❌ Respinsa', color: '#ffebee' },
]

export default function RetururiPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const loadRequests = async () => {
    const res = await fetch('/api/retur')
    const data = await res.json()
    setRequests(data || [])
    setLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/retur', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    loadRequests()
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  return (
    <AdminLayout title="Cereri de Retur">
      <div style={{display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap'}}>
        <button className={filter === 'all' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('all')}>
          Toate ({requests.length})
        </button>
        {statusOptions.map(s => (
          <button key={s.value}
            className={filter === s.value ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setFilter(s.value)}
            style={{fontSize:'13px'}}>
            {s.label} ({requests.filter(r => r.status === s.value).length})
          </button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{textAlign:'center',padding:'40px'}}>Se incarca...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'#6B7A90'}}>Nicio cerere de retur.</div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #f0f4f8'}}>
                {['Comanda','Client','Motiv','Rambursare','Status','Data'].map(h => (
                  <th key={h} style={{padding:'10px',textAlign:'left',fontSize:'12px',color:'#6B7A90',fontWeight:700,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const statusInfo = statusOptions.find(s => s.value === r.status)
                return (
                  <tr key={r.id} style={{borderBottom:'1px solid #f0f4f8'}}>
                    <td style={{padding:'10px',fontWeight:700,fontSize:'13px'}}>#{r.order_number}</td>
                    <td style={{padding:'10px',fontSize:'13px'}}>
                      {r.customer_name}<br/>
                      <span style={{color:'#6B7A90',fontSize:'12px'}}>{r.customer_phone}</span>
                    </td>
                    <td style={{padding:'10px',fontSize:'13px',maxWidth:'220px'}}>{r.reason}</td>
                    <td style={{padding:'10px',fontSize:'12px'}}>
                      {r.refund_method || '—'}
                      {r.bank_details && <><br/><span style={{color:'#6B7A90'}}>{r.bank_details}</span></>}
                    </td>
                    <td style={{padding:'10px'}}>
                      <select
                        value={r.status}
                        onChange={e => updateStatus(r.id, e.target.value)}
                        style={{padding:'6px 10px',borderRadius:'8px',border:'1px solid #e0e4ea',background:statusInfo?.color,fontSize:'12px',fontWeight:700}}
                      >
                        {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td style={{padding:'10px',fontSize:'12px',color:'#6B7A90'}}>
                      {new Date(r.created_at).toLocaleDateString('ro-MD')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

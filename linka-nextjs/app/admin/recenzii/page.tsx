'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface Review {
  id: string
  product_id: string
  customer_name: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  products?: { name: string }
}

function Stars({ rating }: { rating: number }) {
  return <span style={{ color: '#f5a623', fontSize: '14px' }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

export default function RecenziiPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')

  const loadReviews = async () => {
    setLoading(true)
    const res = await fetch('/api/recenzii')
    const data = await res.json()
    setReviews(data || [])
    setLoading(false)
  }

  useEffect(() => { loadReviews() }, [])

  const approve = async (id: string, is_approved: boolean) => {
    await fetch(`/api/recenzii/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved })
    })
    loadReviews()
  }

  const handleDelete = async (r: Review) => {
    if (!confirm(`Stergi recenzia de la ${r.customer_name}?`)) return
    await fetch(`/api/recenzii/${r.id}`, { method: 'DELETE' })
    loadReviews()
  }

  const filtered = reviews.filter(r => filter === 'all' || (filter === 'pending' ? !r.is_approved : r.is_approved))
  const pendingCount = reviews.filter(r => !r.is_approved).length

  return (
    <AdminLayout title="Recenzii">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button className={filter === 'pending' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('pending')}>
          🔔 In asteptare ({pendingCount})
        </button>
        <button className={filter === 'approved' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('approved')}>
          ✓ Aprobate ({reviews.filter(r => r.is_approved).length})
        </button>
        <button className={filter === 'all' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('all')}>
          Toate ({reviews.length})
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Se incarca...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7A90' }}>Nicio recenzie aici.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f4f8' }}>
                {['Produs', 'Client', 'Nota', 'Comentariu', 'Data', 'Actiuni'].map(h => (
                  <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#6B7A90', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 600, maxWidth: '160px' }}>{r.products?.name || '—'}</td>
                  <td style={{ padding: '10px', fontSize: '13px' }}>{r.customer_name}</td>
                  <td style={{ padding: '10px' }}><Stars rating={r.rating} /></td>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#6B7A90', maxWidth: '260px' }}>{r.comment || '—'}</td>
                  <td style={{ padding: '10px', fontSize: '12px', color: '#6B7A90' }}>{new Date(r.created_at).toLocaleDateString('ro-MD')}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {!r.is_approved && (
                      <button onClick={() => approve(r.id, true)} style={{ background: '#e8f5e9', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#1A8A50', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                        Aproba
                      </button>
                    )}
                    {r.is_approved && (
                      <button onClick={() => approve(r.id, false)} style={{ background: '#fff3e0', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#b26a00', cursor: 'pointer', fontSize: '12px' }}>
                        Retrage
                      </button>
                    )}
                    <button onClick={() => handleDelete(r)} style={{ background: '#ffebee', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#c62828', cursor: 'pointer', fontSize: '12px' }}>
                      Sterge
                    </button>
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

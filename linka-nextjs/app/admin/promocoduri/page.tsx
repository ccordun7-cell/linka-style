'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface PromoCode {
  id: string
  code: string
  discount_type: string
  discount_value: number
  is_active: boolean
  usage_limit: number | null
  used_count: number
  expires_at: string | null
  created_at: string
}

export default function PromoCoduriPage() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [percent, setPercent] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadCodes = async () => {
    setLoading(true)
    const res = await fetch('/api/promocoduri')
    const data = await res.json()
    setCodes(data || [])
    setLoading(false)
  }

  useEffect(() => { loadCodes() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!code.trim() || !percent) {
      setError('Completeaza codul si procentul de reducere.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/promocoduri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, discount_value: percent, usage_limit: usageLimit || null })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Eroare la salvare.')
        return
      }
      setCode('')
      setPercent('')
      setUsageLimit('')
      loadCodes()
    } catch {
      setError('Eroare de conexiune. Incearca din nou.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (item: PromoCode) => {
    await fetch(`/api/promocoduri/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active })
    })
    loadCodes()
  }

  const handleDelete = async (item: PromoCode) => {
    if (!confirm(`Stergi codul "${item.code}"?`)) return
    await fetch(`/api/promocoduri/${item.id}`, { method: 'DELETE' })
    loadCodes()
  }

  return (
    <AdminLayout title="Promo Coduri">
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>Adauga cod promo nou</h3>
        <p style={{ fontSize: '13px', color: '#6B7A90', marginBottom: '16px' }}>
          Pentru ambasadori — dai un cod (ex: ANA10), si un procent de reducere. La comanda, clientul introduce codul si primeste automat reducerea.
        </p>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Cod promo</label>
            <input className="form-control" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ex: ANA10" />
          </div>
          <div className="form-group">
            <label>Procent reducere (%)</label>
            <input className="form-control" type="number" value={percent} onChange={e => setPercent(e.target.value)} placeholder="ex: 10" />
          </div>
          <div className="form-group">
            <label>Limita de utilizari (optional)</label>
            <input className="form-control" type="number" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="nelimitat" />
          </div>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Se salveaza...' : '+ Adauga cod'}
          </button>
        </form>
        {error && <p style={{ color: '#c62828', fontSize: '13px', marginTop: '10px' }}>{error}</p>}
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Se incarca...</div>
        ) : codes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7A90' }}>Niciun cod promo inca.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f4f8' }}>
                {['Cod', 'Reducere', 'Utilizari', 'Status', 'Actiuni'].map(h => (
                  <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#6B7A90', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '10px', fontWeight: 800, fontSize: '14px', color: '#ff6b35' }}>{item.code}</td>
                  <td style={{ padding: '10px', fontSize: '13px' }}>-{item.discount_value}%</td>
                  <td style={{ padding: '10px', fontSize: '13px' }}>{item.used_count}{item.usage_limit ? ` / ${item.usage_limit}` : ''}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => toggleActive(item)}
                      style={{
                        padding: '5px 12px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        background: item.is_active ? '#e8f5e9' : '#f0f0f0', color: item.is_active ? '#1A8A50' : '#888'
                      }}>
                      {item.is_active ? '✓ Activ' : 'Inactiv'}
                    </button>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleDelete(item)} style={{ background: '#ffebee', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#c62828', cursor: 'pointer', fontSize: '12px' }}>
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

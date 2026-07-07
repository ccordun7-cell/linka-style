'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Product } from '@/types'

type RowState = 'idle' | 'edited' | 'saving' | 'saved' | 'error'

export default function DescrieriPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [rowState, setRowState] = useState<Record<string, RowState>>({})
  const [savingAll, setSavingAll] = useState(false)

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    const res = await fetch('/api/produse')
    const data = await res.json()
    setProducts(data || [])
    const initialDrafts: Record<string, string> = {}
    ;(data || []).forEach((p: Product) => { initialDrafts[p.id] = p.description || '' })
    setDrafts(initialDrafts)
    setRowState({})
    setLoading(false)
  }

  const brands = Array.from(new Set(products.map(p => p.brand_name).filter(Boolean))).sort()

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand_name || '').toLowerCase().includes(search.toLowerCase())
    const matchesBrand = !brandFilter || p.brand_name === brandFilter
    return matchesSearch && matchesBrand
  })

  const editedCount = Object.keys(rowState).filter(id => rowState[id] === 'edited').length

  const handleChange = (id: string, value: string) => {
    setDrafts(prev => ({ ...prev, [id]: value }))
    setRowState(prev => ({ ...prev, [id]: 'edited' }))
  }

  const saveOne = async (id: string) => {
    setRowState(prev => ({ ...prev, [id]: 'saving' }))
    try {
      const res = await fetch(`/api/produse/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: drafts[id] })
      })
      if (!res.ok) throw new Error()
      setRowState(prev => ({ ...prev, [id]: 'saved' }))
      setProducts(prev => prev.map(p => p.id === id ? { ...p, description: drafts[id] } : p))
      setTimeout(() => setRowState(prev => (prev[id] === 'saved' ? { ...prev, [id]: 'idle' } : prev)), 2000)
    } catch {
      setRowState(prev => ({ ...prev, [id]: 'error' }))
    }
  }

  const saveAll = async () => {
    const idsToSave = Object.keys(rowState).filter(id => rowState[id] === 'edited')
    if (idsToSave.length === 0) return
    setSavingAll(true)
    for (const id of idsToSave) {
      await saveOne(id)
    }
    setSavingAll(false)
  }

  return (
    <AdminLayout title="Descrieri produse">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" placeholder="Cauta dupa nume sau brand..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }} />
        <select className="form-control" value={brandFilter} onChange={e => setBrandFilter(e.target.value)} style={{ maxWidth: '220px' }}>
          <option value="">Toate brandurile</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <button className="btn-primary" onClick={saveAll} disabled={editedCount === 0 || savingAll}
          style={{ opacity: editedCount === 0 || savingAll ? 0.5 : 1, whiteSpace: 'nowrap' }}>
          {savingAll ? 'Se salveaza...' : `Salveaza tot (${editedCount})`}
        </button>
      </div>

      <p style={{ fontSize: '13px', color: '#6B7A90', marginBottom: '16px' }}>
        Editeaza descrierea fiecarui produs — material, tehnologie, caracteristici. Foloseste codul/modelul din denumire pentru a gasi descrierea oficiala a producatorului.
        {' '}{filtered.length} produse afisate.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Se incarca...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(p => {
            const state = rowState[p.id] || 'idle'
            const image = p.images?.[0]?.url
            return (
              <div key={p.id} className="admin-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', background: '#F0F4F8', flexShrink: 0 }}>
                  {image
                    ? <img src={image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👟</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#4AADE8', textTransform: 'uppercase' }}>{p.brand_name}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1B2E4B', marginLeft: '8px' }}>{p.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {state === 'saved' && <span style={{ fontSize: '12px', color: '#1A8A50', fontWeight: 600 }}>✓ Salvat</span>}
                      {state === 'error' && <span style={{ fontSize: '12px', color: '#E84444', fontWeight: 600 }}>Eroare</span>}
                      <button
                        onClick={() => saveOne(p.id)}
                        disabled={state !== 'edited'}
                        style={{
                          fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '8px', border: 'none',
                          background: state === 'edited' ? '#4AADE8' : '#e0e4ea',
                          color: state === 'edited' ? 'white' : '#999',
                          cursor: state === 'edited' ? 'pointer' : 'not-allowed'
                        }}>
                        {state === 'saving' ? 'Se salveaza...' : 'Salveaza'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Descriere: material, tehnologie, caracteristici tehnice..."
                    value={drafts[p.id] || ''}
                    onChange={e => handleChange(p.id, e.target.value)}
                    style={{ width: '100%', fontSize: '13px', lineHeight: 1.5 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface Brand {
  id: string
  slug: string
  name: string
  country?: string
}

export default function BranduriPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadBrands = async () => {
    setLoading(true)
    const res = await fetch('/api/branduri')
    const data = await res.json()
    setBrands(data || [])
    setLoading(false)
  }

  useEffect(() => { loadBrands() }, [])

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Sigur vrei sa stergi brandul "${brand.name}"? Aceasta actiune nu poate fi anulata.`)) return
    setDeletingId(brand.id)
    try {
      const res = await fetch(`/api/branduri?id=${brand.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data.error || 'Nu s-a putut sterge brandul.')
        return
      }
      await loadBrands()
    } catch {
      alert('Eroare de conexiune. Incearca din nou.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout title="Branduri">
      <p style={{ fontSize: '13px', color: '#6B7A90', marginBottom: '16px' }}>
        Poti sterge doar brandurile care nu au niciun produs asociat — e o masura de siguranta, ca sa nu stergi din greseala un brand folosit.
      </p>

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Se incarca...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f4f8' }}>
                {['Nume', 'Slug', 'Actiuni'].map(h => (
                  <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#6B7A90', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '10px', fontWeight: 600, fontSize: '13px' }}>{b.name}</td>
                  <td style={{ padding: '10px', fontSize: '12px', color: '#6B7A90' }}>{b.slug}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      className="btn-danger"
                      disabled={deletingId === b.id}
                      onClick={() => handleDelete(b)}
                      style={{ opacity: deletingId === b.id ? 0.6 : 1 }}
                    >
                      {deletingId === b.id ? 'Se sterge...' : 'Sterge'}
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

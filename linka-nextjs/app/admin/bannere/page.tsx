'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface Banner {
  id: string
  image_url: string
  title: string | null
  cta_text: string | null
  cta_link: string | null
  sort_order: number
  is_active: boolean
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function BannerePage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaLink, setCtaLink] = useState('')

  const loadBanners = async () => {
    setLoading(true)
    const res = await fetch('/api/bannere')
    const data = await res.json()
    setBanners(data || [])
    setLoading(false)
  }

  useEffect(() => { loadBanners() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!file) {
      setError('Alege o imagine.')
      return
    }
    setSaving(true)
    try {
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/bannere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          title: title || null,
          cta_text: ctaText || null,
          cta_link: ctaLink || null,
          sort_order: banners.length
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Eroare la salvare.')
        return
      }
      setFile(null)
      setTitle('')
      setCtaText('')
      setCtaLink('')
      const fileInput = document.getElementById('banner-file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      loadBanners()
    } catch {
      setError('Eroare de conexiune. Incearca din nou.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (b: Banner) => {
    await fetch(`/api/bannere/${b.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !b.is_active })
    })
    loadBanners()
  }

  const move = async (index: number, direction: -1 | 1) => {
    const target = banners[index + direction]
    const current = banners[index]
    if (!target) return
    await Promise.all([
      fetch(`/api/bannere/${current.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: target.sort_order }) }),
      fetch(`/api/bannere/${target.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: current.sort_order }) })
    ])
    loadBanners()
  }

  const handleDelete = async (b: Banner) => {
    if (!confirm('Stergi acest banner?')) return
    await fetch(`/api/bannere/${b.id}`, { method: 'DELETE' })
    loadBanners()
  }

  return (
    <AdminLayout title="Bannere">
      <div className="admin-card" style={{ marginBottom: '20px', background: '#eef6ff', border: '1px solid #cfe4fb' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '10px' }}>📐 Formatul corect al imaginilor</h3>
        <ul style={{ fontSize: '13px', color: '#33475b', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
          <li><b>Dimensiune recomandată: 1600 × 600 px</b> (raport lat, gen 2.67:1 — o imagine mult mai lată decât înaltă, nu pătrată).</li>
          <li>Orice imagine urci va fi decupată automat la acest raport — dacă trimiți o poză cu alt raport, sistemul alege automat partea cea mai relevantă, dar cel mai sigur e s-o pregătești deja în acest format.</li>
          <li>Ține elementele importante (text, fețe, produsul) <b>centrate</b> — marginile din stânga/dreapta pot fi tăiate pe ecrane înguste (telefon).</li>
          <li>Format fișier: JPG sau PNG, sub 5 MB — se convertește automat la WEBP, optimizat.</li>
          <li>Text „Titlu” și „Text buton” de mai jos sunt <b>opționale</b> — dacă vrei tot mesajul deja scris pe imagine (ca un banner gata făcut grafic), lasă-le goale.</li>
        </ul>
      </div>

      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Adaugă banner nou</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Imagine (1600×600 px recomandat)</label>
            <input id="banner-file-input" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="form-group">
            <label>Titlu pe banner (opțional)</label>
            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="ex: Colecția de vară — sandale ortopedice" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Text buton (opțional)</label>
              <input className="form-control" value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="ex: Vezi colecția" />
            </div>
            <div className="form-group">
              <label>Link buton (opțional)</label>
              <input className="form-control" value={ctaLink} onChange={e => setCtaLink(e.target.value)} placeholder="ex: https://linkastyle.com/?type=sandale" />
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Se salvează...' : '+ Adaugă banner'}
          </button>
        </form>
        {error && <p style={{ color: '#c62828', fontSize: '13px', marginTop: '10px' }}>{error}</p>}
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Se încarcă...</div>
        ) : banners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7A90' }}>Niciun banner încă.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {banners.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', border: '1px solid #f0f4f8', borderRadius: '10px', padding: '10px' }}>
                <img src={b.image_url} alt={b.title || ''} style={{ width: '160px', height: '60px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{b.title || <em style={{ color: '#999' }}>Fără titlu</em>}</div>
                  <div style={{ fontSize: '12px', color: '#6B7A90' }}>{b.cta_text ? `Buton: ${b.cta_text}` : 'Fără buton'}{b.cta_link ? ` → ${b.cta_link}` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: '#f0f4f8', border: 'none', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer' }}>↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === banners.length - 1} style={{ background: '#f0f4f8', border: 'none', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer' }}>↓</button>
                  <button
                    onClick={() => toggleActive(b)}
                    style={{
                      padding: '5px 12px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      background: b.is_active ? '#e8f5e9' : '#f0f0f0', color: b.is_active ? '#1A8A50' : '#888'
                    }}>
                    {b.is_active ? '✓ Activ' : 'Inactiv'}
                  </button>
                  <button onClick={() => handleDelete(b)} style={{ background: '#ffebee', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#c62828', cursor: 'pointer', fontSize: '12px' }}>
                    Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Product } from '@/types'

export default function ProdusePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    const res = await fetch('/api/produse')
    const data = await res.json()
    setProducts(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sigur vrei sa ascunzi produsul "${name}"?`)) return
    await fetch(`/api/produse/${id}`, { method: 'DELETE' })
    loadProducts()
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Produse">
      <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
        <input className="form-control" placeholder="Cauta dupa nume sau brand..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{flex:1,minWidth:'200px'}} />
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Adauga produs nou
        </button>
      </div>

      {showForm && <FormAdaugaProdus onClose={() => { setShowForm(false); loadProducts() }} />}

      <div className="admin-card">
        <div style={{marginBottom:'12px',color:'#6B7A90',fontSize:'13px'}}>{filtered.length} produse</div>
        {loading ? <div style={{textAlign:'center',padding:'40px'}}>Se incarca...</div> : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'2px solid #f0f4f8'}}>
                  {['Poza','Produs','Brand','Categorie','Pret','Marimi','Actiuni'].map(h => (
                    <th key={h} style={{padding:'10px',textAlign:'left',fontSize:'12px',color:'#6B7A90',fontWeight:700,textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{borderBottom:'1px solid #f0f4f8'}}>
                    <td style={{padding:'10px'}}>
                      {p.images?.[0] && <img src={p.images[0].url} alt={p.name} style={{width:50,height:50,objectFit:'cover',borderRadius:8}} />}
                    </td>
                    <td style={{padding:'10px',fontWeight:600,fontSize:'13px',maxWidth:'200px'}}>{p.name}</td>
                    <td style={{padding:'10px',fontSize:'13px',color:'#4AADE8',fontWeight:700}}>{p.brand_name}</td>
                    <td style={{padding:'10px',fontSize:'13px'}}>
                      {p.category === 'girls' ? 'Fete' : p.category === 'boys' ? 'Baieti' : p.category === 'barefoot' ? 'Barefoot' : 'Scoala'}
                    </td>
                    <td style={{padding:'10px',fontWeight:700}}>{p.price} MDL</td>
                    <td style={{padding:'10px',fontSize:'12px',color:'#6B7A90'}}>
                      {p.sizes?.map((s: any) => s.size).join(', ')}
                    </td>
                    <td style={{padding:'10px'}}>
                      <button className="btn-danger" onClick={() => handleDelete(p.id, p.name)}>
                        Ascunde
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function FormAdaugaProdus({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', brand_id: '', category: 'girls', type: 'sandale',
    price: '', description: '', is_barefoot: false
  })
  const [sizes, setSizes] = useState([{ size: '', price: '', stock: '10' }])
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/produse?_brands=1').then(r => r.json()).then(d => {
      // Fetch brands separately
    })
    fetch('/api/branduri').then(r => r.json()).then(d => setBrands(d || []))
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImages(prev => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.brand_id || !form.price) {
      alert('Completeaza toate campurile obligatorii!')
      return
    }
    setLoading(true)
    const res = await fetch('/api/produse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseInt(form.price),
        sizes: sizes.filter(s => s.size).map(s => ({ size: parseInt(s.size), price: parseInt(s.price) || parseInt(form.price), stock: parseInt(s.stock) || 10 })),
        images
      })
    })
    if (res.ok) { alert('Produs adaugat cu succes!'); onClose() }
    else { alert('Eroare la adaugare!') }
    setLoading(false)
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,overflow:'auto',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'white',borderRadius:'16px',padding:'32px',width:'100%',maxWidth:'600px',margin:'20px auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'24px'}}>
          <h2 style={{fontSize:'20px',fontWeight:800}}>Adauga produs nou</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#999'}}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label>Nume produs *</label>
              <input className="form-control" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="ex: Sandale fete Biomecanics roz" required />
            </div>
            <div className="form-group">
              <label>Brand *</label>
              <select className="form-control" value={form.brand_id} onChange={e => setForm({...form,brand_id:e.target.value})} required>
                <option value="">Selecteaza brand</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Categorie *</label>
              <select className="form-control" value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                <option value="girls">Fete</option>
                <option value="boys">Baieti</option>
                <option value="barefoot">Barefoot</option>
                <option value="school">Scoala</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tip produs</label>
              <select className="form-control" value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                <option value="sandale">Sandale</option>
                <option value="sneakers">Sneakers</option>
                <option value="pantofi">Pantofi</option>
                <option value="ghete">Ghete</option>
                <option value="balerini">Balerini</option>
              </select>
            </div>
            <div className="form-group">
              <label>Pret de baza (MDL) *</label>
              <input type="number" className="form-control" value={form.price} onChange={e => setForm({...form,price:e.target.value})} placeholder="1200" required />
            </div>
            <div className="form-group" style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:'10px'}}>
              <input type="checkbox" id="barefoot" checked={form.is_barefoot} onChange={e => setForm({...form,is_barefoot:e.target.checked})} />
              <label htmlFor="barefoot" style={{margin:0}}>Este produs Barefoot</label>
            </div>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label>Descriere</label>
              <textarea className="form-control" value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={3} placeholder="Descriere produs, materiale, caracteristici..." />
            </div>
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontSize:'13px',fontWeight:700,color:'#6B7A90',marginBottom:'10px'}}>Marimi si preturi</label>
            {sizes.map((s, i) => (
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'8px',marginBottom:'8px'}}>
                <input className="form-control" type="number" placeholder="Marime EU" value={s.size} onChange={e => { const n = [...sizes]; n[i].size = e.target.value; setSizes(n) }} />
                <input className="form-control" type="number" placeholder="Pret MDL" value={s.price} onChange={e => { const n = [...sizes]; n[i].price = e.target.value; setSizes(n) }} />
                <input className="form-control" type="number" placeholder="Stoc" value={s.stock} onChange={e => { const n = [...sizes]; n[i].stock = e.target.value; setSizes(n) }} />
                <button type="button" onClick={() => setSizes(sizes.filter((_,j) => j !== i))} style={{background:'#ffebee',border:'none',borderRadius:'8px',padding:'0 12px',color:'#c62828',cursor:'pointer'}}>✕</button>
              </div>
            ))}
            <button type="button" onClick={() => setSizes([...sizes, {size:'',price:'',stock:'10'}])} className="btn-secondary" style={{fontSize:'13px'}}>
              + Adauga marime
            </button>
          </div>

          <div className="form-group">
            <label>Imagini produs (max 3)</label>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{display:'block',marginBottom:'10px'}} />
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {images.map((img, i) => (
                <div key={i} style={{position:'relative'}}>
                  <img src={img} style={{width:80,height:80,objectFit:'cover',borderRadius:8}} />
                  <button type="button" onClick={() => setImages(images.filter((_,j) => j !== i))}
                    style={{position:'absolute',top:-4,right:-4,background:'#E84444',color:'white',border:'none',borderRadius:'50%',width:18,height:18,fontSize:11,cursor:'pointer'}}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:'flex',gap:'12px',marginTop:'24px'}}>
            <button type="submit" className="btn-primary" disabled={loading} style={{flex:1,justifyContent:'center',padding:'14px'}}>
              {loading ? 'Se salveaza...' : 'Publica produsul'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} style={{padding:'14px 20px'}}>Anuleaza</button>
          </div>
        </form>
      </div>
    </div>
  )
}

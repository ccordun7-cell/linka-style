'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Product } from '@/types'

// Conversie marime EU -> lungime talpa in cm, dupa standardul "Paris point"
// (fiecare marime EU = ~0.667cm), acelasi calcul ca pe site (index.html).
function sizeToCm(size: number): number {
  if (!size || isNaN(size)) return 0
  return Math.round((12.3 + (size - 20) * (2 / 3)) * 10) / 10
}

export default function ProdusePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')

  const loadProducts = async () => {
    const res = await fetch('/api/produse', { cache: 'no-store' })
    const data = await res.json()
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sigur vrei sa ascunzi produsul "${name}"?`)) return
    try {
      const res = await fetch(`/api/produse/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(`Nu s-a putut ascunde produsul${err.error ? ': ' + err.error : ''}. Verifica daca esti inca logat (incearca sa reincarci pagina sau sa te loghezi din nou).`)
        return
      }
      // Scot produsul imediat din lista locala, fara sa astept refetch (evita orice problema de cache)
      setProducts(prev => prev.filter(p => p.id !== id))
      loadProducts()
    } catch {
      alert('Eroare de conexiune. Incearca din nou.')
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand_name?.toLowerCase().includes(search.toLowerCase())
  )

  const uniqueBrands = Array.from(new Set(products.map(p => p.brand_name).filter(Boolean)))
    .sort()
    .map(name => ({ id: name as string, name: name as string }))

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

      {showForm && <FormProdus onClose={() => { setShowForm(false); loadProducts() }} existingBrands={uniqueBrands} />}
      {editingProduct && <FormProdus product={editingProduct} onClose={() => { setEditingProduct(null); loadProducts() }} existingBrands={uniqueBrands} />}

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
                  <tr key={p.id} style={{borderBottom:'1px solid #f0f4f8', cursor:'pointer'}}
                    onClick={() => setEditingProduct(p)}>
                    <td style={{padding:'10px'}}>
                      {p.images?.[0] && <img src={p.images[0].url} alt={p.name} style={{width:50,height:50,objectFit:'cover',borderRadius:8}} />}
                    </td>
                    <td style={{padding:'10px',fontWeight:600,fontSize:'13px',maxWidth:'200px'}}>
                      {p.name}
                      {p.product_code && <div style={{fontSize:'11px',color:'#6B7A90',fontWeight:400}}>Cod: {p.product_code}</div>}
                    </td>
                    <td style={{padding:'10px',fontSize:'13px',color:'#4AADE8',fontWeight:700}}>{p.brand_name}</td>
                    <td style={{padding:'10px',fontSize:'13px'}}>
                      {p.category === 'girls' ? 'Fete' : p.category === 'boys' ? 'Baieti' : p.category === 'barefoot' ? 'Barefoot' : 'Scoala'}
                    </td>
                    <td style={{padding:'10px',fontWeight:700}}>
                      {p.is_sale && p.sale_price ? (
                        <>
                          <span style={{textDecoration:'line-through',color:'#999',fontWeight:400,fontSize:'12px',marginRight:'6px'}}>{p.price} MDL</span>
                          <span style={{color:'#ff6b35'}}>{p.sale_price} MDL</span>
                        </>
                      ) : `${p.price} MDL`}
                    </td>
                    <td style={{padding:'10px',fontSize:'12px',color:'#6B7A90'}}>
                      {p.sizes?.map((s: any) => s.size).join(', ')}
                    </td>
                    <td style={{padding:'10px', display:'flex', gap:'8px'}} onClick={e => e.stopPropagation()}>
                      <button className="btn-secondary" onClick={() => setEditingProduct(p)}>
                        Editeaza
                      </button>
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

function FormProdus({ product, onClose, existingBrands }: { product?: Product, onClose: () => void, existingBrands: { id: string, name: string }[] }) {
  const isEditing = !!product
  const [form, setForm] = useState({
    name: product?.name || '',
    name_ru: product?.name_ru || '',
    product_code: product?.product_code || '',
    brand_name: product?.brand_name || '',
    category: product?.category || 'girls',
    type: product?.type || 'sandale',
    price: product?.price ? String(product.price) : '',
    description: product?.description || '',
    description_ru: product?.description_ru || '',
    is_barefoot: product?.is_barefoot || false,
    is_premium: product?.is_premium || false,
    is_sale: product?.is_sale || false,
    sale_price: product?.sale_price ? String(product.sale_price) : '',
    discount_percent: (product?.is_sale && product?.sale_price && product?.price)
      ? String(Math.round((1 - product.sale_price / product.price) * 100))
      : ''
  })
  const [sizes, setSizes] = useState(
    product?.sizes?.length
      ? product.sizes.map((s: any) => ({ size: String(s.size), price: String(s.price), stock: String(s.stock) }))
      : [{ size: '', price: '', stock: '10' }]
  )
  const [existingImages, setExistingImages] = useState<{ id: string, url: string }[]>(
    (product?.images || []).slice().sort((a: any, b: any) => a.position - b.position).map((img: any) => ({ id: img.id, url: img.url }))
  )
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const moveImage = (index: number, direction: -1 | 1) => {
    setExistingImages(prev => {
      const next = prev.slice()
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const removeExistingImage = (id: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== id))
    setDeletedImageIds(prev => [...prev, id])
  }

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
    if (!form.name || !form.brand_name || !form.price) {
      setError('Completeaza toate campurile obligatorii!')
      return
    }
    if (form.is_sale && (!form.discount_percent || parseInt(form.discount_percent) <= 0 || parseInt(form.discount_percent) >= 100)) {
      setError('Introdu un procent de reducere valid (intre 1 si 99)!')
      return
    }
    setError('')
    setLoading(true)
    try {
      const sizesPayload = sizes.filter(s => s.size).map(s => ({
        size: parseInt(s.size), price: parseInt(s.price) || parseInt(form.price), stock: parseInt(s.stock) || 10
      }))

      let res: Response
      if (isEditing) {
        res = await fetch(`/api/produse/${product!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            name_ru: form.name_ru,
            product_code: form.product_code,
            brand_name: form.brand_name,
            price: parseInt(form.price),
            description: form.description,
            description_ru: form.description_ru,
            category: form.category,
            is_barefoot: form.is_barefoot,
            is_premium: form.is_premium,
            is_sale: form.is_sale,
            sale_price: form.is_sale ? parseInt(form.sale_price) : null,
            is_active: true,
            sizes: sizesPayload,
            image_order: existingImages.map(img => img.id),
            deleted_image_ids: deletedImageIds.length ? deletedImageIds : undefined,
            new_images: images.length ? images : undefined
          })
        })
      } else {
        res = await fetch('/api/produse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            price: parseInt(form.price),
            sale_price: form.is_sale ? parseInt(form.sale_price) : null,
            sizes: sizesPayload,
            images
          })
        })
      }

      if (res.ok) {
        onClose()
      } else {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'Eroare la salvare. Verifica daca esti inca logat.')
      }
    } catch {
      setError('Eroare de conexiune. Incearca din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,overflow:'auto',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'clamp(8px,3vw,20px)'}}>
      <div style={{background:'white',borderRadius:'16px',padding:'clamp(16px,4vw,32px)',width:'100%',maxWidth:'600px',margin:'clamp(8px,3vw,20px) auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'24px'}}>
          <h2 style={{fontSize:'20px',fontWeight:800}}>{isEditing ? `Editeaza: ${product!.name}` : 'Adauga produs nou'}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#999'}}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',gap:'16px'}}>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label>Nume produs (Română) *</label>
              <input className="form-control" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="ex: Sandale fete Biomecanics roz" required />
            </div>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label>Nume produs (Русский)</label>
              <input className="form-control" value={form.name_ru} onChange={e => setForm({...form,name_ru:e.target.value})} placeholder="ex: Сандалии для девочек Biomecanics розовые" />
            </div>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label>Cod produs</label>
              <input className="form-control" value={form.product_code} onChange={e => setForm({...form,product_code:e.target.value})} placeholder="ex: cel de pe factura/actele de la furnizor" />
            </div>
            <div className="form-group">
              <label>Brand *</label>
              <input className="form-control" value={form.brand_name} onChange={e => setForm({...form,brand_name:e.target.value})}
                placeholder="ex: Biomecanics" required list="branduri-existente" />
              <datalist id="branduri-existente">
                {existingBrands.map(b => <option key={b.id} value={b.name} />)}
              </datalist>
              {isEditing && <p style={{fontSize:'12px',color:'#6B7A90',marginTop:'4px'}}>Daca schimbi brandul, produsul se muta automat la noul brand (il creeaza daca nu exista deja).</p>}
            </div>
            <div className="form-group">
              <label>Categorie *</label>
              <select className="form-control" value={form.category} onChange={e => setForm({...form,category:e.target.value as any})}>
                <option value="girls">Fete</option>
                <option value="boys">Baieti</option>
                <option value="barefoot">Barefoot</option>
                <option value="school">Scoala</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tip produs</label>
              <select className="form-control" value={form.type} onChange={e => setForm({...form,type:e.target.value})} disabled={isEditing}>
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
            <div className="form-group" style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:'10px'}}>
              <input type="checkbox" id="premium" checked={form.is_premium} onChange={e => setForm({...form,is_premium:e.target.checked})} />
              <label htmlFor="premium" style={{margin:0}}>Primii pași (insignă pentru încălțăminte de bebeluși care încep să meargă)</label>
            </div>
            <div className="form-group" style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:'10px'}}>
              <input type="checkbox" id="sale" checked={form.is_sale} onChange={e => setForm({...form,is_sale:e.target.checked})} />
              <label htmlFor="sale" style={{margin:0}}>La reducere</label>
            </div>
            {form.is_sale && (
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label>Procent reducere (%) *</label>
                <input type="number" className="form-control" value={form.discount_percent}
                  onChange={e => {
                    const percent = e.target.value
                    const base = parseInt(form.price)
                    const computed = (base && percent) ? Math.round(base * (1 - parseInt(percent) / 100)) : ''
                    setForm({...form, discount_percent: percent, sale_price: String(computed)})
                  }}
                  placeholder="ex: 10 pentru 10% reducere" />
                {form.price && form.sale_price && parseInt(form.discount_percent) > 0 && (
                  <p style={{fontSize:'12px',color:'#1A8A50',marginTop:'4px'}}>
                    Pret redus: <b>{form.sale_price} MDL</b> (din {form.price} MDL)
                  </p>
                )}
              </div>
            )}
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label>Descriere (Română)</label>
              <textarea className="form-control" value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={3} placeholder="Descriere produs, materiale, caracteristici..." />
            </div>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label>Descriere (Русский)</label>
              <textarea className="form-control" value={form.description_ru} onChange={e => setForm({...form,description_ru:e.target.value})} rows={3} placeholder="Описание товара, материалы, характеристики..." />
            </div>
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontSize:'13px',fontWeight:700,color:'#6B7A90',marginBottom:'10px'}}>Marimi si preturi</label>
            <p style={{fontSize:'12px',color:'#6B7A90',marginBottom:'8px'}}>Lungimea in cm se calculeaza automat, dupa standardul EU (~0.67cm per marime).</p>
            {sizes.map((s, i) => (
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 50px 1fr 1fr auto',gap:'6px',marginBottom:'8px',alignItems:'center'}}>
                <input className="form-control" type="number" placeholder="Marime EU" value={s.size} onChange={e => { const n = [...sizes]; n[i].size = e.target.value; setSizes(n) }} />
                <span style={{fontSize:'12px',color:'#6B7A90',textAlign:'center'}}>{s.size ? `${sizeToCm(parseInt(s.size))} cm` : '—'}</span>
                <input className="form-control" type="number" placeholder="Pret MDL" value={s.price} onChange={e => { const n = [...sizes]; n[i].price = e.target.value; setSizes(n) }} />
                <input className="form-control" type="number" placeholder="Stoc" value={s.stock} onChange={e => { const n = [...sizes]; n[i].stock = e.target.value; setSizes(n) }} />
                <button type="button" onClick={() => setSizes(sizes.filter((_,j) => j !== i))} style={{background:'#ffebee',border:'none',borderRadius:'8px',padding:'0 12px',color:'#c62828',cursor:'pointer'}}>✕</button>
              </div>
            ))}
            <button type="button" onClick={() => setSizes([...sizes, {size:'',price:'',stock:'10'}])} className="btn-secondary" style={{fontSize:'13px'}}>
              + Adauga marime
            </button>
          </div>

          {isEditing && existingImages.length > 0 && (
            <div className="form-group">
              <label>Imagini curente — prima este poza de fata a produsului</label>
              <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px'}}>
                {existingImages.map((img, i) => (
                  <div key={img.id} style={{position:'relative', width:90}}>
                    <img src={img.url} style={{width:90,height:90,objectFit:'cover',borderRadius:8,border: i===0 ? '2px solid #4AADE8' : '1px solid #e0e4ea'}} />
                    {i === 0 && <span style={{position:'absolute',top:4,left:4,background:'#4AADE8',color:'white',fontSize:'9px',fontWeight:700,padding:'2px 6px',borderRadius:6}}>FAȚĂ</span>}
                    <button type="button" onClick={() => removeExistingImage(img.id)}
                      style={{position:'absolute',top:-6,right:-6,background:'#E84444',color:'white',border:'none',borderRadius:'50%',width:22,height:22,cursor:'pointer',fontSize:12,lineHeight:1}}>✕</button>
                    <div style={{display:'flex',justifyContent:'center',gap:4,marginTop:4}}>
                      <button type="button" disabled={i===0} onClick={() => moveImage(i,-1)}
                        style={{fontSize:11,padding:'2px 8px',borderRadius:6,border:'1px solid #e0e4ea',background:i===0?'#f5f5f5':'white',cursor:i===0?'not-allowed':'pointer',color:i===0?'#ccc':'#1B2E4B'}}>◀</button>
                      <button type="button" disabled={i===existingImages.length-1} onClick={() => moveImage(i,1)}
                        style={{fontSize:11,padding:'2px 8px',borderRadius:6,border:'1px solid #e0e4ea',background:i===existingImages.length-1?'#f5f5f5':'white',cursor:i===existingImages.length-1?'not-allowed':'pointer',color:i===existingImages.length-1?'#ccc':'#1B2E4B'}}>▶</button>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{fontSize:'12px',color:'#6B7A90',marginBottom:'10px'}}>
                Foloseste săgețile ◀ ▶ ca să schimbi ordinea. Prima poză din stânga apare pe cardul produsului și în catalog.
              </p>
            </div>
          )}

          <div className="form-group">
            <label>{isEditing ? 'Adaugă poze noi (opțional)' : 'Imagini produs (max 3)'}</label>
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

          {error && <p style={{color:'#E84444',fontSize:'13px',marginTop:'8px'}}>{error}</p>}

          <div style={{display:'flex',gap:'12px',marginTop:'24px'}}>
            <button type="submit" className="btn-primary" disabled={loading} style={{flex:1,justifyContent:'center',padding:'14px'}}>
              {loading ? 'Se salveaza...' : isEditing ? 'Salveaza modificarile' : 'Publica produsul'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} style={{padding:'14px 20px'}}>Anuleaza</button>
          </div>
        </form>
      </div>
    </div>
  )
}

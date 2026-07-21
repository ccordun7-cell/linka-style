'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

const statusOptions = [
  { value: 'noua', label: '🔔 Noua', color: '#fff9c4' },
  { value: 'confirmata', label: '✅ Confirmata', color: '#e8f5e9' },
  { value: 'in_livrare', label: '🚚 In livrare', color: '#fff3e0' },
  { value: 'livrata', label: '📦 Livrata', color: '#e8f5e9' },
  { value: 'anulata', label: '❌ Anulata', color: '#ffebee' },
]

export default function ComenziPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)

  const loadOrders = async () => {
    const res = await fetch('/api/comenzi')
    const data = await res.json()
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/comenzi/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    loadOrders()
    if (selected?.id === id) setSelected({ ...selected, status })
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <AdminLayout title="Comenzi">
      <div style={{display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap'}}>
        <button className={filter === 'all' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('all')}>
          Toate ({orders.length})
        </button>
        {statusOptions.map(s => (
          <button key={s.value}
            className={filter === s.value ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setFilter(s.value)}
            style={{fontSize:'13px'}}>
            {s.label} ({orders.filter(o => o.status === s.value).length})
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns: selected ? '1fr 1fr' : '1fr',gap:'20px'}}>
        {/* Lista comenzi */}
        <div className="admin-card">
          {loading ? <div style={{textAlign:'center',padding:'40px'}}>Se incarca...</div> : (
            <div>
              {filtered.map((order: any) => (
                <div key={order.id}
                  onClick={() => setSelected(order)}
                  style={{padding:'14px',borderRadius:'12px',marginBottom:'8px',cursor:'pointer',
                    border: `2px solid ${selected?.id === order.id ? '#4AADE8' : '#f0f4f8'}`,
                    background: selected?.id === order.id ? '#f0f9ff' : 'white'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                    <span style={{fontWeight:800}}>#{order.order_number}</span>
                    <span className={`badge badge-${order.status}`}>
                      {statusOptions.find(s => s.value === order.status)?.label}
                    </span>
                  </div>
                  <div style={{fontSize:'14px',fontWeight:600}}>{order.customer_name}</div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px'}}>
                    <span style={{fontSize:'13px',color:'#6B7A90'}}>{order.customer_phone}</span>
                    <span style={{fontSize:'14px',fontWeight:700,color:'#1B2E4B'}}>{order.total} MDL</span>
                  </div>
                  <div style={{fontSize:'12px',color:'#6B7A90',marginTop:'4px'}}>
                    {new Date(order.created_at).toLocaleString('ro-MD')}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{textAlign:'center',padding:'40px',color:'#6B7A90'}}>Nicio comanda</div>}
            </div>
          )}
        </div>

        {/* Detalii comanda */}
        {selected && (
          <div className="admin-card">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'20px'}}>
              <h3 style={{fontWeight:800}}>Comanda #{selected.order_number}</h3>
              <button onClick={() => setSelected(null)} style={{background:'none',border:'none',fontSize:'18px',cursor:'pointer',color:'#999'}}>✕</button>
            </div>

            <div style={{display:'grid',gap:'12px',marginBottom:'20px'}}>
              {[
                ['Client', selected.customer_name],
                ['Telefon', selected.customer_phone],
                ['Email', selected.customer_email || 'Neindicat'],
                ['Adresa', `${selected.delivery_address || 'Neindicata'}, ${selected.delivery_city}`],
                ['Plata', selected.payment_method],
                ['Data', new Date(selected.created_at).toLocaleString('ro-MD')],
              ].map(([label, value]) => (
                <div key={label} style={{display:'flex',gap:'8px'}}>
                  <span style={{fontSize:'13px',color:'#6B7A90',minWidth:'80px',fontWeight:600}}>{label}:</span>
                  <span style={{fontSize:'13px'}}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{background:'#f8faff',borderRadius:'12px',padding:'16px',marginBottom:'20px'}}>
              <h4 style={{marginBottom:'12px',fontSize:'14px',fontWeight:700}}>Produse comandate:</h4>
              {selected.items?.map((item: any, i: number) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #e8f0f8'}}>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:600}}>{item.product_brand} — {item.product_name}</div>
                    <div style={{fontSize:'12px',color:'#6B7A90'}}>EU {item.size} × {item.quantity}</div>
                  </div>
                  <div style={{fontWeight:700}}>{item.price} MDL</div>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:'12px',fontWeight:800,fontSize:'16px'}}>
                <span>Total:</span>
                <span style={{color:'#1B2E4B'}}>{selected.total} MDL</span>
              </div>
              <div style={{fontSize:'12px',color:'#1A8A50',marginTop:'4px'}}>
                Livrare: {selected.delivery_cost === 0 ? 'GRATUITA' : selected.delivery_cost + ' MDL'}
              </div>
            </div>

            <div>
              <label style={{display:'block',fontSize:'13px',fontWeight:700,color:'#6B7A90',marginBottom:'8px'}}>Actualizeaza status:</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                {statusOptions.map(s => (
                  <button key={s.value}
                    onClick={() => updateStatus(selected.id, s.value)}
                    style={{padding:'8px 14px',border:`2px solid ${selected.status === s.value ? '#4AADE8' : '#e0e4ea'}`,
                      borderRadius:'8px',background:selected.status === s.value ? '#4AADE8' : 'white',
                      color:selected.status === s.value ? 'white' : '#1B2E4B',fontWeight:600,fontSize:'12px',cursor:'pointer'}}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginTop:'16px',display:'flex',gap:'8px'}}>
              <a href={`tel:${selected.customer_phone}`} className="btn-primary" style={{flex:1,textAlign:'center',padding:'12px'}}>
                📞 Suna clientul
              </a>
              {selected.customer_email && (
                <a href={`mailto:${selected.customer_email}`} className="btn-secondary" style={{flex:1,textAlign:'center',padding:'12px'}}>
                  ✉️ Email
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

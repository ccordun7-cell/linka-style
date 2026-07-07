'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'

type View = 'cart' | 'checkout' | 'success'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, deliveryCost, total, clearCart } = useCart()
  const [view, setView] = useState<View>('cart')
  const [orderNumber, setOrderNumber] = useState<number | null>(null)

  const handleClose = () => {
    closeCart()
    setTimeout(() => setView('cart'), 300)
  }

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100 }}>
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420,
        background: 'white', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,.1)'
      }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F4F8' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1B2E4B' }}>
            {view === 'cart' ? `Coșul tău (${items.length})` : view === 'checkout' ? 'Finalizează comanda' : 'Comandă trimisă'}
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>✕</button>
        </div>

        {view === 'cart' && (
          <CartView
            items={items}
            removeItem={removeItem}
            updateQuantity={updateQuantity}
            subtotal={subtotal}
            deliveryCost={deliveryCost}
            total={total}
            onCheckout={() => setView('checkout')}
            onContinue={handleClose}
          />
        )}

        {view === 'checkout' && (
          <CheckoutView
            items={items}
            total={total}
            deliveryCost={deliveryCost}
            onBack={() => setView('cart')}
            onSuccess={(orderNum: number) => { setOrderNumber(orderNum); clearCart(); setView('success') }}
          />
        )}

        {view === 'success' && (
          <SuccessView orderNumber={orderNumber} onClose={handleClose} />
        )}
      </div>
    </div>
  )
}

function CartView({ items, removeItem, updateQuantity, subtotal, deliveryCost, total, onCheckout, onContinue }: any) {
  if (items.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <span style={{ fontSize: 44, marginBottom: 12 }}>🛒</span>
        <p style={{ color: '#6B7A90', fontSize: 14, marginBottom: 20 }}>Coșul tău este gol momentan.</p>
        <button onClick={onContinue} style={{ background: '#4AADE8', color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
          Continuă cumpărăturile
        </button>
      </div>
    )
  }

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {items.map((item: any) => (
          <div key={`${item.product_id}-${item.size}`} style={{ display: 'flex', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #F0F4F8' }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, background: '#F0F4F8', flexShrink: 0, overflow: 'hidden' }}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👟</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4AADE8' }}>{item.product_brand}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1B2E4B', lineHeight: 1.3, margin: '2px 0' }}>{item.product_name}</div>
              <div style={{ fontSize: 12, color: '#6B7A90' }}>Mărime: {item.size}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e4ea', borderRadius: 8 }}>
                  <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                    style={{ background: 'none', border: 'none', width: 26, height: 26, cursor: 'pointer', fontSize: 14, color: '#1B2E4B' }}>−</button>
                  <span style={{ width: 24, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                    style={{ background: 'none', border: 'none', width: 26, height: 26, cursor: 'pointer', fontSize: 14, color: '#1B2E4B' }}>+</button>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1B2E4B' }}>{item.price * item.quantity} MDL</span>
              </div>
            </div>
            <button onClick={() => removeItem(item.product_id, item.size)}
              style={{ background: 'none', border: 'none', color: '#E84444', cursor: 'pointer', fontSize: 16, alignSelf: 'flex-start' }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ padding: 20, borderTop: '1px solid #F0F4F8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7A90', marginBottom: 6 }}>
          <span>Subtotal</span><span>{subtotal} MDL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7A90', marginBottom: 12 }}>
          <span>Livrare</span><span>{deliveryCost === 0 ? 'Gratuită' : `${deliveryCost} MDL`}</span>
        </div>
        {deliveryCost > 0 && (
          <p style={{ fontSize: 11, color: '#1A8A50', marginBottom: 12 }}>
            Mai adaugă {1000 - subtotal} MDL pentru livrare gratuită
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#1B2E4B', marginBottom: 16 }}>
          <span>Total</span><span>{total} MDL</span>
        </div>
        <button onClick={onCheckout} style={{ width: '100%', background: '#4AADE8', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Finalizează comanda
        </button>
      </div>
    </>
  )
}

function CheckoutView({ items, total, deliveryCost, onBack, onSuccess }: any) {
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    delivery_address: '', delivery_city: 'Chișinău', payment_method: 'ramburs', notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.delivery_address.trim()) {
      setError('Completează numele, telefonul și adresa de livrare.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/comenzi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Eroare la trimiterea comenzii')
      onSuccess(data.order_number)
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#4AADE8', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          ← Înapoi la coș
        </button>

        <div className="form-group">
          <label>Nume complet *</label>
          <input className="form-control" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="Ion Popescu" required />
        </div>
        <div className="form-group">
          <label>Telefon *</label>
          <input className="form-control" type="tel" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} placeholder="+373 6X XXX XXX" required />
        </div>
        <div className="form-group">
          <label>Email (opțional)</label>
          <input className="form-control" type="email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} placeholder="email@exemplu.com" />
        </div>
        <div className="form-group">
          <label>Oraș / Localitate</label>
          <input className="form-control" value={form.delivery_city} onChange={e => setForm({ ...form, delivery_city: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Adresa de livrare *</label>
          <textarea className="form-control" rows={2} value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })} placeholder="Stradă, număr, bloc, apartament" required />
        </div>
        <div className="form-group">
          <label>Metoda de plată</label>
          <select className="form-control" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
            <option value="ramburs">Ramburs la livrare (cash)</option>
            <option value="transfer">Transfer bancar</option>
          </select>
        </div>
        <div className="form-group">
          <label>Observații (opțional)</label>
          <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Detalii suplimentare despre livrare" />
        </div>

        {error && <p style={{ color: '#E84444', fontSize: 13, marginTop: 4 }}>{error}</p>}
      </div>

      <div style={{ padding: 20, borderTop: '1px solid #F0F4F8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#1B2E4B', marginBottom: 16 }}>
          <span>Total de plată</span><span>{total} MDL</span>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#1A8A50', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Se trimite...' : 'Trimite comanda'}
        </button>
      </div>
    </form>
  )
}

function SuccessView({ orderNumber, onClose }: { orderNumber: number | null; onClose: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <span style={{ fontSize: 52, marginBottom: 16 }}>✅</span>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1B2E4B', marginBottom: 8 }}>Comanda a fost trimisă!</h3>
      {orderNumber && (
        <p style={{ fontSize: 14, color: '#6B7A90', marginBottom: 4 }}>Numărul comenzii: <strong>#{orderNumber}</strong></p>
      )}
      <p style={{ fontSize: 13, color: '#6B7A90', marginBottom: 24 }}>Te vom contacta în curând pentru confirmare.</p>
      <button onClick={onClose} style={{ background: '#4AADE8', color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
        Continuă cumpărăturile
      </button>
    </div>
  )
}

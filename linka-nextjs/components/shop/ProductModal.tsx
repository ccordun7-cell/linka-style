'use client'
import { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/lib/cart-context'

const CATEGORY_LABELS: Record<string, string> = {
  girls: 'Fete', boys: 'Băieți', barefoot: 'Barefoot', school: 'Școală'
}

export default function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [added, setAdded] = useState(false)

  const images = product.images?.length ? product.images : []
  const sortedSizes = [...(product.sizes || [])].sort((a, b) => a.size - b.size)
  const displayPrice = product.is_sale && product.sale_price ? product.sale_price : product.price
  const selectedSizeData = sortedSizes.find(s => s.size === selectedSize)

  const handleAddToCart = () => {
    if (!selectedSize || !selectedSizeData) return
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_brand: product.brand_name,
      slug: product.slug,
      image_url: images[0]?.url || '',
      size: selectedSize,
      price: selectedSizeData.price || displayPrice,
      quantity: 1
    })
    setAdded(true)
    setTimeout(() => { onClose() }, 700)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        overflowY: 'auto', padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 20, maxWidth: 860, width: '100%',
          margin: '20px auto', display: 'flex', overflow: 'hidden'
        }}
        className="product-modal"
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, background: 'white', border: 'none',
            borderRadius: '50%', width: 34, height: 34, fontSize: 16, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,.15)', zIndex: 2
          }}
        >
          ✕
        </button>

        <div style={{ flex: '0 0 45%', background: '#F0F4F8', position: 'relative' }} className="product-modal-image">
          {images[activeImage] ? (
            <img src={images[activeImage].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 320 }} />
          ) : (
            <div style={{ width: '100%', height: '100%', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>👟</div>
          )}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', gap: 6, justifyContent: 'center' }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: i === activeImage ? '#4AADE8' : 'rgba(255,255,255,.7)'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: 28, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#4AADE8', textTransform: 'uppercase' }}>{product.brand_name}</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1B2E4B', margin: '6px 0 10px', lineHeight: 1.3 }}>{product.name}</h2>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#1B2E4B' }}>{displayPrice} MDL</span>
            {product.is_sale && product.sale_price && (
              <span style={{ fontSize: 15, color: '#999', textDecoration: 'line-through' }}>{product.price} MDL</span>
            )}
          </div>
          <span style={{ fontSize: 12, color: '#6B7A90' }}>{CATEGORY_LABELS[product.category]}{product.is_barefoot ? ' · Barefoot' : ''}</span>

          {product.description && (
            <p style={{ fontSize: 14, color: '#6B7A90', lineHeight: 1.6, margin: '16px 0' }}>{product.description}</p>
          )}

          <div style={{ marginTop: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#6B7A90', marginBottom: 10 }}>Alege mărimea (EU)</label>
            {sortedSizes.length === 0 ? (
              <p style={{ fontSize: 13, color: '#999' }}>Nu sunt mărimi disponibile momentan.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sortedSizes.map(s => {
                  const outOfStock = s.stock <= 0
                  return (
                    <button
                      key={s.size}
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(s.size)}
                      style={{
                        width: 48, height: 44, borderRadius: 10, fontWeight: 700, fontSize: 14,
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        border: selectedSize === s.size ? '2px solid #4AADE8' : '1.5px solid #e0e4ea',
                        background: outOfStock ? '#f5f5f5' : selectedSize === s.size ? '#eaf5fd' : 'white',
                        color: outOfStock ? '#ccc' : '#1B2E4B',
                        textDecoration: outOfStock ? 'line-through' : 'none'
                      }}
                    >
                      {s.size}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || added}
            style={{
              marginTop: 24, width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: added ? '#1A8A50' : selectedSize ? '#4AADE8' : '#e0e4ea',
              color: added || selectedSize ? 'white' : '#999',
              fontWeight: 700, fontSize: 15, cursor: selectedSize ? 'pointer' : 'not-allowed'
            }}
          >
            {added ? '✓ Adăugat în coș' : selectedSize ? 'Adaugă în coș' : 'Alege mai întâi mărimea'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .product-modal { flex-direction: column; }
          .product-modal-image { flex: none !important; height: 280px; }
        }
      `}</style>
    </div>
  )
}

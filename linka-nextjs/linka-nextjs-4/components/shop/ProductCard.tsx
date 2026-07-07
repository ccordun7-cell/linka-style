import { Product } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  girls: 'Fete', boys: 'Băieți', barefoot: 'Barefoot', school: 'Școală'
}

export default function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const image = product.images?.[0]?.url
  const hasStock = product.sizes?.some(s => s.stock > 0)
  const displayPrice = product.is_sale && product.sale_price ? product.sale_price : product.price

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,.05)', transition: 'transform .15s, box-shadow .15s',
        display: 'flex', flexDirection: 'column'
      }}
      className="product-card"
    >
      <div style={{ position: 'relative', aspectRatio: '1', background: '#F0F4F8' }}>
        {image ? (
          <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👟</div>
        )}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {product.is_sale && (
            <span style={{ background: '#E84444', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 20 }}>REDUCERE</span>
          )}
          {product.is_barefoot && (
            <span style={{ background: '#1A8A50', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 20 }}>BAREFOOT</span>
          )}
          {product.is_premium && (
            <span style={{ background: '#1B2E4B', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 20 }}>PREMIUM</span>
          )}
        </div>
        {!hasStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#1B2E4B', color: 'white', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 20 }}>Stoc epuizat</span>
          </div>
        )}
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4AADE8', textTransform: 'uppercase' }}>{product.brand_name}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1B2E4B', margin: '4px 0 8px', lineHeight: 1.3 }}>{product.name}</span>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1B2E4B' }}>{displayPrice} MDL</span>
          {product.is_sale && product.sale_price && (
            <span style={{ fontSize: 13, color: '#999', textDecoration: 'line-through' }}>{product.price} MDL</span>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#6B7A90', marginTop: 4 }}>{CATEGORY_LABELS[product.category]}</span>
      </div>

      <style>{`
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.1); }
      `}</style>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'

const CATEGORIES = [
  { value: '', label: 'Toate' },
  { value: 'girls', label: 'Fete' },
  { value: 'boys', label: 'Băieți' },
  { value: 'barefoot', label: 'Barefoot' },
  { value: 'school', label: 'Școală' },
]

export default function Header({
  activeCategory, onCategoryChange, search, onSearchChange
}: {
  activeCategory: string
  onCategoryChange: (c: string) => void
  search: string
  onSearchChange: (s: string) => void
}) {
  const { totalItems, openCart } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 200, background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <a href="/" style={{ fontSize: 24, fontWeight: 900, color: '#1B2E4B', whiteSpace: 'nowrap' }}>
          Linka<span style={{ color: '#4AADE8' }}>Style</span>
        </a>

        <div style={{ flex: 1, display: 'flex', maxWidth: 420 }} className="header-search">
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Caută încălțăminte..."
            style={{
              width: '100%', border: '1.5px solid #e0e4ea', borderRadius: 10,
              padding: '10px 14px', fontSize: 14, outline: 'none'
            }}
          />
        </div>

        <nav className="header-nav" style={{ display: 'flex', gap: 4 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => onCategoryChange(c.value)}
              style={{
                background: activeCategory === c.value ? '#4AADE8' : 'transparent',
                color: activeCategory === c.value ? 'white' : '#1B2E4B',
                border: 'none', borderRadius: 8, padding: '8px 14px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {c.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setMobileMenuOpen(o => !o)}
          className="header-burger"
          style={{ display: 'none', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#1B2E4B' }}
        >
          ☰
        </button>

        <button onClick={openCart} style={{ position: 'relative', background: '#F0F4F8', border: 'none', borderRadius: 10, width: 44, height: 44, cursor: 'pointer', fontSize: 20, flexShrink: 0 }}>
          🛒
          {totalItems > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4, background: '#E84444', color: 'white',
              borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div style={{ padding: '0 20px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => { onCategoryChange(c.value); setMobileMenuOpen(false) }}
              style={{
                background: activeCategory === c.value ? '#4AADE8' : '#F0F4F8',
                color: activeCategory === c.value ? 'white' : '#1B2E4B',
                border: 'none', borderRadius: 8, padding: '8px 14px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .header-nav { display: none !important; }
          .header-burger { display: block !important; }
        }
        @media (max-width: 560px) {
          .header-search { display: none !important; }
        }
      `}</style>
    </header>
  )
}

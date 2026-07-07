import { Brand } from '@/types'

export type SortOption = 'newest' | 'price_asc' | 'price_desc'

export default function FilterBar({
  brands, activeBrand, onBrandChange, sort, onSortChange, resultsCount
}: {
  brands: Brand[]
  activeBrand: string
  onBrandChange: (b: string) => void
  sort: SortOption
  onSortChange: (s: SortOption) => void
  resultsCount: number
}) {
  return (
    <div style={{
      maxWidth: 1200, margin: '0 auto', padding: '20px 20px 0',
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
    }}>
      <select
        value={activeBrand}
        onChange={e => onBrandChange(e.target.value)}
        style={{
          border: '1.5px solid #e0e4ea', borderRadius: 10, padding: '9px 12px',
          fontSize: 14, fontWeight: 600, color: '#1B2E4B', background: 'white', cursor: 'pointer'
        }}
      >
        <option value="">Toate brandurile</option>
        {brands.map(b => (
          <option key={b.id} value={b.slug}>{b.name}</option>
        ))}
      </select>

      <select
        value={sort}
        onChange={e => onSortChange(e.target.value as SortOption)}
        style={{
          border: '1.5px solid #e0e4ea', borderRadius: 10, padding: '9px 12px',
          fontSize: 14, fontWeight: 600, color: '#1B2E4B', background: 'white', cursor: 'pointer'
        }}
      >
        <option value="newest">Cele mai noi</option>
        <option value="price_asc">Preț crescător</option>
        <option value="price_desc">Preț descrescător</option>
      </select>

      <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6B7A90', fontWeight: 600 }}>
        {resultsCount} {resultsCount === 1 ? 'produs' : 'produse'}
      </span>
    </div>
  )
}

'use client'
import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/shop/Header'
import Hero from '@/components/shop/Hero'
import FilterBar, { SortOption } from '@/components/shop/FilterBar'
import ProductCard from '@/components/shop/ProductCard'
import ProductModal from '@/components/shop/ProductModal'
import CartDrawer from '@/components/shop/CartDrawer'
import Footer from '@/components/shop/Footer'
import { Product, Brand } from '@/types'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetch('/api/branduri').then(r => r.json()).then(setBrands).catch(() => {})
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (brand) params.set('brand', brand)
    if (search) params.set('search', search)
    try {
      const res = await fetch(`/api/produse?${params.toString()}`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [category, brand, search])

  useEffect(() => {
    const timeout = setTimeout(loadProducts, search ? 350 : 0)
    return () => clearTimeout(timeout)
  }, [loadProducts, search])

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.is_sale && a.sale_price ? a.sale_price : a.price
    const priceB = b.is_sale && b.sale_price ? b.sale_price : b.price
    if (sort === 'price_asc') return priceA - priceB
    if (sort === 'price_desc') return priceB - priceA
    return 0 // newest — ordinea vine deja din API (created_at desc)
  })

  return (
    <>
      <Header activeCategory={category} onCategoryChange={setCategory} search={search} onSearchChange={setSearch} />
      <Hero />
      <FilterBar
        brands={brands}
        activeBrand={brand}
        onBrandChange={setBrand}
        sort={sort}
        onSortChange={setSort}
        resultsCount={sortedProducts.length}
      />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6B7A90' }}>Se încarcă produsele...</div>
        ) : sortedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6B7A90' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>👟</span>
            Nu am găsit produse pentru filtrele selectate.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {sortedProducts.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => setActiveProduct(p)} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {activeProduct && (
        <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />
      )}

      <CartDrawer />
    </>
  )
}

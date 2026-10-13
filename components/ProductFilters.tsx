'use client'

import { useDeferredValue, useState } from 'react'
import ProductCard from '@/components/ProductCard'

type Product = {
  id: number
  name: string
  slug: string
  description: string
  price: number
  imageUrl: string
  category: { name: string }
}

const categoryIcons: Record<string, string> = {
  Semua: '▦',
  VGA: '◈',
  Processor: '◉',
  RAM: '▤',
  Storage: '▱',
  Motherboard: '▥',
  Power: '⌁',
}

export default function ProductFilters({ products, categories }: { products: Product[]; categories: string[] }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const deferredQuery = useDeferredValue(query)
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'Semua' || product.category.name === activeCategory
    const searchableText = `${product.name} ${product.description}`.toLowerCase()
    return matchesCategory && searchableText.includes(deferredQuery.toLowerCase())
  })

  return (
    <div className="catalog-browser">
      <div className="catalog-toolbar">
        <label className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari komponen..." aria-label="Cari komponen" /></label>
        <span className="catalog-count">{visibleProducts.length} produk</span>
      </div>
      <div className="category-filter" aria-label="Filter kategori produk">
        {['Semua', ...categories].map((category) => <button key={category} className={activeCategory === category ? 'category-button is-active' : 'category-button'} onClick={() => setActiveCategory(category)}><span>{categoryIcons[category] ?? '□'}</span>{category}</button>)}
      </div>
      {visibleProducts.length > 0 ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-products"><span>∅</span><p>Komponen tidak ditemukan.</p><button onClick={() => { setQuery(''); setActiveCategory('Semua') }}>Reset filter</button></div>}
    </div>
  )
}

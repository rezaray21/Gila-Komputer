import { prisma } from '@/lib/prisma'
import ProductFilters from '@/components/ProductFilters'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import AccountMenu from '@/components/AccountMenu'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ where: { status: 'ACTIVE' }, include: { category: true } })
  const categories = [...new Set(products.map((product) => product.category.name))]

  return (
    <main className="catalog-page">
      <nav className="site-nav page-width catalog-nav"><BrandMark /><div className="nav-right"><Link href="/" className="text-link">← Kembali ke beranda</Link><AccountMenu /></div></nav>
      <div className="page-width catalog-intro"><p className="eyebrow">Gila Komputer / katalog komponen</p><h1>Naikkan level<br /><em>cara kerjamu.</em></h1><p>Komponen pilihan, stok yang jelas, dan spesifikasi yang mudah dipahami. Temukan bagian terbaik untuk build yang ingin kamu wujudkan.</p></div>
      <div className="page-width"><ProductFilters products={products} categories={categories} /></div>
    </main>
  )
}
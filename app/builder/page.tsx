import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import BuildConfigurator from '@/components/BuildConfigurator'
import BrandMark from '@/components/BrandMark'
import AccountMenu from '@/components/AccountMenu'

export default async function BuilderPage() {
  const products = await prisma.product.findMany({ where: { status: 'ACTIVE' }, include: { category: true }, orderBy: { categoryId: 'asc' } })
  const categories = [...new Set(products.map((product) => product.category.name))]

  return (
    <main className="catalog-page builder-page">
      <nav className="site-nav page-width catalog-nav"><BrandMark /><div className="nav-right"><Link href="/products" className="text-link">Pilih komponen <span>↗</span></Link><AccountMenu /></div></nav>
      <div className="page-width builder-intro"><p className="eyebrow">Gila Komputer / personal builder</p><h1>Rakit PC<br /><em>yang mengerti kamu.</em></h1><p>Mulai dari kebutuhanmu, bukan dari tebakan. Pilih komponen yang tersedia dan dapatkan gambaran build-mu dalam hitungan menit.</p></div>
      <div className="page-width"><BuildConfigurator products={products} categories={categories} /></div>
    </main>
  )
}

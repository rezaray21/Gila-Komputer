import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductDetailActions from '@/components/ProductDetailActions'
import BrandMark from '@/components/BrandMark'
import AccountMenu from '@/components/AccountMenu'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } })

  // Produk nonaktif disembunyikan dari publik (admin mengelolanya di /admin/products).
  if (!product || product.status !== 'ACTIVE') notFound()

  const specs = product.specs as Record<string, string>

  return (
    <main className="catalog-page product-detail-page">
      <nav className="site-nav page-width catalog-nav"><BrandMark /><div className="nav-right"><Link href="/products" className="text-link">← Kembali ke katalog</Link><AccountMenu /></div></nav>
      <div className="page-width product-detail-layout">
        <div className="product-detail-image">
          {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} width={900} height={680} priority /> : <span>{product.category.name.slice(0, 1)}</span>}
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{product.category.name}</p>
          <h1>{product.name}</h1>
          <p className="product-detail-description">{product.description}</p>
          <strong className="product-detail-price">Rp {product.price.toLocaleString('id-ID')}</strong>
          <p className={product.stock > 0 ? 'product-stock' : 'product-stock is-empty'}>{product.stock > 0 ? `${product.stock} unit tersedia` : 'Stok habis'}</p>
          <ProductDetailActions product={{ id: product.id, name: product.name, category: product.category.name, price: product.price, stock: product.stock }} />
          <div className="product-specs"><p className="eyebrow">Spesifikasi</p>{Object.entries(specs).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        </div>
      </div>
    </main>
  )
}

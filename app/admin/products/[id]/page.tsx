import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdminProductForm from '@/components/AdminProductForm'
import { prisma } from '@/lib/prisma'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id: Number(id) } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!product) notFound()

  const specs = product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)
    ? Object.fromEntries(Object.entries(product.specs as Record<string, unknown>).map(([key, value]) => [key, String(value)]))
    : {}

  return <>
    <header className="admin-header"><div><p className="eyebrow"><Link href="/admin/products">← Produk</Link></p><h1>Ubah produk</h1></div>{product.status === 'ACTIVE' && <Link href={`/products/${product.slug}`} className="text-link" target="_blank">Lihat di toko ↗</Link>}</header>
    <AdminProductForm categories={categories} brands={brands} product={{ id: product.id, name: product.name, slug: product.slug, description: product.description, price: product.price, stock: product.stock, status: product.status, imageUrl: product.imageUrl, specs, categoryId: product.categoryId, brandId: product.brandId }} />
  </>
}

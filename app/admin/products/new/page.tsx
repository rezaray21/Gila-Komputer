import Link from 'next/link'
import AdminProductForm from '@/components/AdminProductForm'
import { prisma } from '@/lib/prisma'

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([prisma.category.findMany({ orderBy: { name: 'asc' } }), prisma.brand.findMany({ orderBy: { name: 'asc' } })])
  return <>
    <header className="admin-header"><div><p className="eyebrow"><Link href="/admin/products">← Produk</Link></p><h1>Tambah produk</h1></div></header>
    <AdminProductForm categories={categories} brands={brands} />
  </>
}

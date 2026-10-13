import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import Pagination from '@/components/Pagination'
import { prisma } from '@/lib/prisma'
import { formatIDR } from '@/lib/payment-methods'

const PAGE_SIZE = 20

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const { q = '', status = '', page = '1' } = await searchParams
  const query = q.trim()
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1)
  const statusFilter = status === 'ACTIVE' || status === 'INACTIVE' ? status : ''

  const where: Prisma.ProductWhereInput = {
    ...(query ? { OR: [{ name: { contains: query } }, { slug: { contains: query } }] } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  }
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, include: { category: true, brand: true }, orderBy: { id: 'desc' }, skip: (currentPage - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ])

  return <>
    <header className="admin-header"><div><p className="eyebrow">Katalog</p><h1>Produk</h1></div><Link href="/admin/products/new" className="button button-dark">Tambah produk <span>＋</span></Link></header>
    <form className="admin-toolbar" action="/admin/products">
      <input name="q" defaultValue={query} placeholder="Cari nama atau slug…" aria-label="Cari produk" />
      <select name="status" defaultValue={statusFilter} aria-label="Filter status"><option value="">Semua status</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option></select>
      <button className="button button-outline button-small" type="submit">Terapkan</button>
      <span className="admin-muted">{total} produk</span>
    </form>
    {products.length === 0 ? <div className="admin-empty"><p>Tidak ada produk yang cocok.</p></div> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Produk</th><th>Kategori</th><th className="num">Harga</th><th className="num">Stok</th><th>Status</th><th /></tr></thead>
      <tbody>{products.map((product) => <tr key={product.id}>
        <td><strong>{product.name}</strong><small>{product.brand?.name ?? 'Tanpa merek'}</small></td>
        <td>{product.category.name}</td>
        <td className="num">{formatIDR(product.price)}</td>
        <td className="num"><span className={product.stock === 0 ? 'stock-pill is-empty' : product.stock <= 3 ? 'stock-pill' : undefined}>{product.stock}</span></td>
        <td><span className={product.status === 'ACTIVE' ? 'status-badge status-completed' : 'status-badge status-cancelled'}>{product.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}</span></td>
        <td className="num"><Link href={`/admin/products/${product.id}`} className="text-link">Ubah</Link></td>
      </tr>)}</tbody>
    </table></div>}
    <Pagination basePath="/admin/products" params={{ q: query, status: statusFilter }} page={currentPage} totalPages={Math.ceil(total / PAGE_SIZE)} />
  </>
}

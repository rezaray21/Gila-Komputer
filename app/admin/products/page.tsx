import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import Pagination from '@/components/Pagination'
import { prisma } from '@/lib/prisma'
import { formatIDR } from '@/lib/payment-methods'

const PAGE_SIZE = 20
const SORT_OPTIONS = {
  newest: { createdAt: 'desc' },
  name: { name: 'asc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  stock_asc: { stock: 'asc' },
  stock_desc: { stock: 'desc' },
} satisfies Record<string, Prisma.ProductOrderByWithRelationInput>

type SearchParams = {
  q?: string
  status?: string
  category?: string
  brand?: string
  stock?: string
  sort?: string
  page?: string
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q = '', status = '', category = '', brand = '', stock = '', sort = '', page = '1' } = await searchParams
  const query = q.trim()
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1)
  const statusFilter = status === 'ACTIVE' || status === 'INACTIVE' ? status : ''
  const categoryId = /^\d+$/.test(category) ? Number(category) : undefined
  const brandId = /^\d+$/.test(brand) ? Number(brand) : undefined
  const stockFilter = ['low', 'empty', 'available'].includes(stock) ? stock : ''
  const sortFilter = Object.prototype.hasOwnProperty.call(SORT_OPTIONS, sort) ? sort as keyof typeof SORT_OPTIONS : 'newest'

  const searchConditions: Prisma.ProductWhereInput[] = query ? [
    { name: { contains: query } },
    { slug: { contains: query } },
    { category: { name: { contains: query } } },
    { brand: { name: { contains: query } } },
  ] : []
  const where: Prisma.ProductWhereInput = {
    ...(searchConditions.length ? { OR: searchConditions } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(stockFilter === 'low' ? { stock: { gt: 0, lte: 3 } } : {}),
    ...(stockFilter === 'empty' ? { stock: 0 } : {}),
    ...(stockFilter === 'available' ? { stock: { gt: 3 } } : {}),
  }
  const [total, products, categories, brands, allProducts, activeProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true, brand: true },
      orderBy: SORT_OPTIONS[sortFilter],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 3 } } }),
    prisma.product.count({ where: { stock: 0 } }),
  ])
  const filterParams = { q: query, status: statusFilter, category, brand, stock: stockFilter, sort: sortFilter === 'newest' ? '' : sortFilter }

  return <>
    <header className="admin-header"><div><p className="eyebrow">Katalog</p><h1>Produk</h1></div><Link href="/admin/products/new" className="button button-dark">Tambah produk <span>＋</span></Link></header>
    <section className="admin-product-stats" aria-label="Ringkasan produk">
      <div className="admin-product-stat"><span>Total produk</span><strong>{allProducts.toLocaleString('id-ID')}</strong></div>
      <div className="admin-product-stat"><span>Produk aktif</span><strong>{activeProducts.toLocaleString('id-ID')}</strong></div>
      <Link className="admin-product-stat" href="/admin/products?stock=low"><span>Stok menipis (1–3)</span><strong>{lowStockProducts.toLocaleString('id-ID')}</strong></Link>
      <Link className="admin-product-stat is-alert" href="/admin/products?stock=empty"><span>Stok habis</span><strong>{outOfStockProducts.toLocaleString('id-ID')}</strong></Link>
    </section>
    <form className="admin-toolbar admin-product-filters" action="/admin/products">
      <input name="q" defaultValue={query} placeholder="Cari nama, slug, kategori, atau merek…" aria-label="Cari produk" />
      <select name="status" defaultValue={statusFilter} aria-label="Filter status"><option value="">Semua status</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option></select>
      <select name="category" defaultValue={categoryId ? String(categoryId) : ''} aria-label="Filter kategori"><option value="">Semua kategori</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <select name="brand" defaultValue={brandId ? String(brandId) : ''} aria-label="Filter merek"><option value="">Semua merek</option>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <select name="stock" defaultValue={stockFilter} aria-label="Filter kondisi stok"><option value="">Semua stok</option><option value="low">Menipis (1–3)</option><option value="empty">Habis (0)</option><option value="available">Tersedia (&gt;3)</option></select>
      <select name="sort" defaultValue={sortFilter} aria-label="Urutkan produk"><option value="newest">Terbaru</option><option value="name">Nama A–Z</option><option value="price_asc">Harga terendah</option><option value="price_desc">Harga tertinggi</option><option value="stock_asc">Stok terendah</option><option value="stock_desc">Stok tertinggi</option></select>
      <button className="button button-outline button-small" type="submit">Terapkan</button>
      <Link className="text-link admin-filter-reset" href="/admin/products">Reset filter</Link>
      <span className="admin-muted">{total.toLocaleString('id-ID')} produk ditemukan</span>
    </form>
    {products.length === 0 ? <div className="admin-empty"><p>Tidak ada produk yang cocok.</p><Link className="text-link" href="/admin/products">Hapus filter dan tampilkan semua produk</Link></div> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Produk</th><th>Kategori</th><th className="num">Harga</th><th className="num">Stok</th><th>Status</th><th /></tr></thead>
      <tbody>{products.map((product) => <tr key={product.id}>
        <td><strong>{product.name}</strong><small>{product.brand?.name ?? 'Tanpa merek'}</small></td>
        <td>{product.category.name}</td>
        <td className="num">{formatIDR(product.price)}</td>
        <td className="num"><span className={product.stock === 0 ? 'stock-pill is-empty' : product.stock <= 3 ? 'stock-pill is-low' : 'stock-pill is-available'}>{product.stock}{product.stock === 0 ? ' · Habis' : product.stock <= 3 ? ' · Menipis' : ''}</span></td>
        <td><span className={product.status === 'ACTIVE' ? 'status-badge status-completed' : 'status-badge status-cancelled'}>{product.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}</span></td>
        <td className="num"><Link href={`/admin/products/${product.id}`} className="text-link">Ubah</Link></td>
      </tr>)}</tbody>
    </table></div>}
    <Pagination basePath="/admin/products" params={filterParams} page={currentPage} totalPages={Math.ceil(total / PAGE_SIZE)} />
  </>
}

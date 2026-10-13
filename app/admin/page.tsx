import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/format'
import { formatIDR } from '@/lib/payment-methods'

const LOW_STOCK_LIMIT = 3

export default async function AdminDashboardPage() {
  const [orderCount, pendingCount, revenue, activeProducts, customerCount, lowStock, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] } } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'PEMBELI' } }),
    prisma.product.findMany({ where: { status: 'ACTIVE', stock: { lte: LOW_STOCK_LIMIT } }, orderBy: [{ stock: 'asc' }, { name: 'asc' }], take: 8, include: { category: true } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
  ])

  const stats = [
    { label: 'Omzet (sudah dibayar)', value: formatIDR(revenue._sum.total ?? 0), href: '/admin/orders' },
    { label: 'Pesanan', value: String(orderCount), href: '/admin/orders' },
    { label: 'Menunggu pembayaran', value: String(pendingCount), href: '/admin/orders?status=PENDING' },
    { label: 'Produk aktif', value: String(activeProducts), href: '/admin/products' },
    { label: 'Pembeli terdaftar', value: String(customerCount), href: '/admin/users' },
  ]

  return <>
    <header className="admin-header"><div><p className="eyebrow">Gila Komputer / admin</p><h1>Ringkasan</h1></div></header>
    <div className="admin-stats">{stats.map((stat) => <Link href={stat.href} key={stat.label} className="admin-stat"><span>{stat.label}</span><strong>{stat.value}</strong></Link>)}</div>
    <div className="admin-columns">
      <section className="admin-panel">
        <div className="admin-panel-head"><h2>Pesanan terbaru</h2><Link href="/admin/orders" className="text-link">Semua pesanan</Link></div>
        {recentOrders.length === 0 ? <p className="admin-muted">Belum ada pesanan.</p> : <ul className="admin-list">{recentOrders.map((order) => <li key={order.id}><Link href={`/admin/orders/${encodeURIComponent(order.orderNumber)}`}><span><strong>{order.orderNumber}</strong><small>{order.customerName} · {formatDateTime(order.createdAt)}</small></span><span className="admin-list-side"><StatusBadge status={order.status} /><b>{formatIDR(order.total)}</b></span></Link></li>)}</ul>}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-head"><h2>Stok menipis</h2><Link href="/admin/products" className="text-link">Kelola produk</Link></div>
        {lowStock.length === 0 ? <p className="admin-muted">Semua produk aktif punya stok lebih dari {LOW_STOCK_LIMIT}.</p> : <ul className="admin-list">{lowStock.map((product) => <li key={product.id}><Link href={`/admin/products/${product.id}`}><span><strong>{product.name}</strong><small>{product.category.name}</small></span><span className={product.stock === 0 ? 'stock-pill is-empty' : 'stock-pill'}>{product.stock === 0 ? 'Habis' : `${product.stock} unit`}</span></Link></li>)}</ul>}
      </section>
    </div>
  </>
}

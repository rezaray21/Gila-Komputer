import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import Pagination from '@/components/Pagination'
import StatusBadge from '@/components/StatusBadge'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/format'
import { formatIDR } from '@/lib/payment-methods'
import { isOrderStatus, ORDER_STATUSES, STATUS_LABELS } from '@/lib/order-status'

const PAGE_SIZE = 20

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const { q = '', status = '', page = '1' } = await searchParams
  const query = q.trim()
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1)
  const statusFilter = isOrderStatus(status) ? status : ''

  const where: Prisma.OrderWhereInput = {
    ...(query ? { OR: [{ orderNumber: { contains: query } }, { customerName: { contains: query } }, { email: { contains: query } }] } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  }
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (currentPage - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ])
  const tabHref = (value: string) => { const params = new URLSearchParams(); if (value) params.set('status', value); if (query) params.set('q', query); const text = params.toString(); return text ? `/admin/orders?${text}` : '/admin/orders' }

  return <>
    <header className="admin-header"><div><p className="eyebrow">Transaksi</p><h1>Pesanan</h1></div></header>
    <nav className="admin-tabs" aria-label="Filter status">
      <Link href={tabHref('')} className={statusFilter === '' ? 'is-active' : undefined}>Semua</Link>
      {ORDER_STATUSES.map((value) => <Link key={value} href={tabHref(value)} className={statusFilter === value ? 'is-active' : undefined}>{STATUS_LABELS[value]}</Link>)}
    </nav>
    <form className="admin-toolbar" action="/admin/orders">
      <input name="q" defaultValue={query} placeholder="Cari nomor pesanan, nama, atau email…" aria-label="Cari pesanan" />
      {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
      <button className="button button-outline button-small" type="submit">Cari</button>
      <span className="admin-muted">{total} pesanan</span>
    </form>
    {orders.length === 0 ? <div className="admin-empty"><p>Tidak ada pesanan yang cocok.</p></div> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Nomor</th><th>Pelanggan</th><th className="num">Total</th><th>Status</th><th>Akun</th><th>Dibuat</th><th /></tr></thead>
      <tbody>{orders.map((order) => <tr key={order.id}>
        <td><strong>{order.orderNumber}</strong></td>
        <td>{order.customerName}<small>{order.email}</small></td>
        <td className="num">{formatIDR(order.total)}</td>
        <td><StatusBadge status={order.status} /></td>
        <td>{order.userId ? 'Member' : 'Tamu'}</td>
        <td>{formatDateTime(order.createdAt)}</td>
        <td className="num"><Link href={`/admin/orders/${encodeURIComponent(order.orderNumber)}`} className="text-link">Detail</Link></td>
      </tr>)}</tbody>
    </table></div>}
    <Pagination basePath="/admin/orders" params={{ q: query, status: statusFilter }} page={currentPage} totalPages={Math.ceil(total / PAGE_SIZE)} />
  </>
}

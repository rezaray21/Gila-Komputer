import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import AccountMenu from '@/components/AccountMenu'
import StatusBadge from '@/components/StatusBadge'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { formatDate } from '@/lib/format'
import { formatIDR } from '@/lib/payment-methods'

export const metadata = { title: 'Akun saya / Gila Komputer' }

export default async function AccountPage() {
  const user = await requireUser('/akun')
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { select: { quantity: true } } },
  })

  return (
    <main className="catalog-page account-page">
      <nav className="site-nav page-width catalog-nav"><BrandMark /><div className="nav-right"><Link href="/products" className="text-link">← Kembali belanja</Link><AccountMenu /></div></nav>
      <div className="page-width account-layout">
        <aside className="account-profile">
          <p className="eyebrow">Gila Komputer / akun</p>
          <h1>Halo,<br /><em>{user.name.split(' ')[0]}.</em></h1>
          <dl>
            <div><dt>Nama</dt><dd>{user.name}</dd></div>
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            {user.phone && <div><dt>Telepon</dt><dd>{user.phone}</dd></div>}
          </dl>
        </aside>
        <section className="account-orders" aria-labelledby="orders-heading">
          <h2 id="orders-heading">Pesanan saya</h2>
          {orders.length === 0
            ? <div className="admin-empty"><p>Belum ada pesanan di akun ini.</p><Link href="/products" className="button button-dark">Mulai belanja <span>↗</span></Link></div>
            : <ul className="order-list">{orders.map((order) => <li key={order.id}>
              <Link href={`/akun/pesanan/${encodeURIComponent(order.orderNumber)}`} className="order-row">
                <span className="order-row-main"><strong>{order.orderNumber}</strong><small>{formatDate(order.createdAt)} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} barang</small></span>
                <span className="order-row-side"><StatusBadge status={order.status} /><b>{formatIDR(order.total)}</b></span>
              </Link>
            </li>)}</ul>}
        </section>
      </div>
    </main>
  )
}

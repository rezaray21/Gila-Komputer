import Link from 'next/link'
import { notFound } from 'next/navigation'
import BrandMark from '@/components/BrandMark'
import AccountMenu from '@/components/AccountMenu'
import StatusBadge from '@/components/StatusBadge'
import PendingOrderActions from '@/components/PendingOrderActions'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { formatDateTime } from '@/lib/format'
import { findPaymentMethod, formatIDR } from '@/lib/payment-methods'

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const orderNumber = decodeURIComponent((await params).orderNumber)
  const user = await requireUser(`/akun/pesanan/${encodeURIComponent(orderNumber)}`)
  // Hanya pesanan milik akun yang sedang login; selain itu 404 (bukan 403) agar nomor pesanan orang lain tidak terkonfirmasi.
  const order = await prisma.order.findFirst({ where: { orderNumber, userId: user.id }, include: { items: true } })
  if (!order) notFound()
  const method = order.paymentMethod ? findPaymentMethod(order.paymentMethod) : undefined

  return (
    <main className="catalog-page account-page">
      <nav className="site-nav page-width catalog-nav"><BrandMark /><div className="nav-right"><Link href="/akun" className="text-link">← Semua pesanan</Link><AccountMenu /></div></nav>
      <div className="page-width order-detail">
        <header className="order-detail-head">
          <div><p className="eyebrow">Detail pesanan</p><h1>{order.orderNumber}</h1><p className="order-detail-date">Dibuat {formatDateTime(order.createdAt)}</p></div>
          <StatusBadge status={order.status} />
        </header>
        <div className="order-detail-grid">
          <section>
            <h2>Barang</h2>
            <ul className="order-items">{order.items.map((item) => <li key={item.id}><span>{item.name}<small>{item.quantity} × {formatIDR(item.unitPrice)}</small></span><strong>{formatIDR(item.unitPrice * item.quantity)}</strong></li>)}</ul>
            <div className="order-totals">
              <div><span>Subtotal</span><strong>{formatIDR(order.subtotal)}</strong></div>
              <div><span>Ongkir ({order.shippingMethod === 'express' ? 'Express' : 'Regular'})</span><strong>{formatIDR(order.shippingFee)}</strong></div>
              <div className="is-total"><span>Total</span><strong>{formatIDR(order.total)}</strong></div>
            </div>
          </section>
          <section>
            <h2>Pengiriman & pembayaran</h2>
            <dl className="order-facts">
              <div><dt>Penerima</dt><dd>{order.customerName}<br />{order.phone}</dd></div>
              <div><dt>Alamat</dt><dd>{order.address}<br />{order.city} {order.postalCode}</dd></div>
              <div><dt>Metode bayar</dt><dd>{method ? `${method.icon} ${method.name}` : order.paymentMethod ?? '-'}</dd></div>
              {order.paymentRef && <div><dt>Referensi bayar</dt><dd>{order.paymentRef}</dd></div>}
              {order.paidAt && <div><dt>Dibayar</dt><dd>{formatDateTime(order.paidAt)}</dd></div>}
            </dl>
            {order.status === 'PENDING' && order.paymentMethod && <PendingOrderActions orderNumber={order.orderNumber} total={order.total} paymentMethodCode={order.paymentMethod} />}
          </section>
        </div>
      </div>
    </main>
  )
}

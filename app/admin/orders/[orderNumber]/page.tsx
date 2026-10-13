import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdminOrderActions from '@/components/AdminOrderActions'
import StatusBadge from '@/components/StatusBadge'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/format'
import { findPaymentMethod, formatIDR } from '@/lib/payment-methods'
import { ACTION_LABELS, allowedTransitions } from '@/lib/order-status'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const orderNumber = decodeURIComponent((await params).orderNumber)
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true, user: { select: { id: true, name: true, email: true } } } })
  if (!order) notFound()
  const method = order.paymentMethod ? findPaymentMethod(order.paymentMethod) : undefined
  const actions = allowedTransitions(order.status).map((status) => ({ status, label: ACTION_LABELS[status], destructive: status === 'CANCELLED' }))

  return <>
    <header className="admin-header"><div><p className="eyebrow"><Link href="/admin/orders">← Pesanan</Link></p><h1>{order.orderNumber}</h1><p className="admin-muted">Dibuat {formatDateTime(order.createdAt)}</p></div><StatusBadge status={order.status} /></header>
    <section className="admin-panel"><div className="admin-panel-head"><h2>Ubah status</h2></div><AdminOrderActions orderNumber={order.orderNumber} actions={actions} /></section>
    <div className="admin-columns">
      <section className="admin-panel">
        <div className="admin-panel-head"><h2>Barang</h2></div>
        <ul className="order-items">{order.items.map((item) => <li key={item.id}><span>{item.name}<small>{item.quantity} × {formatIDR(item.unitPrice)}</small></span><strong>{formatIDR(item.unitPrice * item.quantity)}</strong></li>)}</ul>
        <div className="order-totals"><div><span>Subtotal</span><strong>{formatIDR(order.subtotal)}</strong></div><div><span>Ongkir ({order.shippingMethod === 'express' ? 'Express' : 'Regular'})</span><strong>{formatIDR(order.shippingFee)}</strong></div><div className="is-total"><span>Total</span><strong>{formatIDR(order.total)}</strong></div></div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-head"><h2>Pelanggan</h2></div>
        <dl className="order-facts">
          <div><dt>Penerima</dt><dd>{order.customerName}<br />{order.phone}<br />{order.email}</dd></div>
          <div><dt>Alamat</dt><dd>{order.address}<br />{order.city} {order.postalCode}</dd></div>
          <div><dt>Akun</dt><dd>{order.user ? `${order.user.name} (${order.user.email})` : 'Checkout tamu'}</dd></div>
          <div><dt>Metode bayar</dt><dd>{method ? `${method.icon} ${method.name}` : order.paymentMethod ?? '-'}</dd></div>
          {order.paymentRef && <div><dt>Referensi bayar</dt><dd>{order.paymentRef}</dd></div>}
          {order.paidAt && <div><dt>Dibayar</dt><dd>{formatDateTime(order.paidAt)}</dd></div>}
        </dl>
      </section>
    </div>
  </>
}

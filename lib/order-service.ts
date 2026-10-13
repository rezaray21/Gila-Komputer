import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { canTransition, statusLabel, type OrderStatus } from '@/lib/order-status'

type Tx = Prisma.TransactionClient

export class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

type OrderForAccess = { userId: number | null; payToken: string | null }

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

// Pemilik akun boleh mengakses pesanannya; pembeli tamu memakai token acak yang
// hanya dikirim ke browser yang membuat pesanan.
export function canAccessOrder(order: OrderForAccess, user: { id: number } | null, payToken?: string) {
  if (user && order.userId === user.id) return true
  return Boolean(payToken && order.payToken && safeEqual(payToken, order.payToken))
}

export const newPayToken = () => randomBytes(24).toString('hex')

async function restoreStock(tx: Tx, items: { productId: number; quantity: number }[]) {
  for (const item of items) {
    await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
  }
}

// Update bersyarat (status harus masih sama) supaya dua permintaan bersamaan tidak
// bisa sama-sama berhasil, misalnya membatalkan dua kali lalu mengembalikan stok dua kali.
async function transition(tx: Tx, orderId: number, from: string, data: Prisma.OrderUpdateManyMutationInput) {
  const result = await tx.order.updateMany({ where: { id: orderId, status: from }, data })
  if (result.count !== 1) throw new OrderError('Status pesanan baru saja berubah. Muat ulang halaman lalu coba lagi.', 409)
}

type OrderWithItems = { id: number; status: string; items: { productId: number; quantity: number }[] }

export async function cancelOrder(tx: Tx, order: OrderWithItems) {
  await transition(tx, order.id, order.status, { status: 'CANCELLED' })
  await restoreStock(tx, order.items)
}

export async function markOrderPaid(tx: Tx, order: { id: number; status: string }, paymentRef: string) {
  await transition(tx, order.id, order.status, { status: 'PAID', paymentRef, paidAt: new Date() })
}

// Perubahan status oleh admin. Mengembalikan pesanan terbaru.
export async function changeOrderStatus(tx: Tx, orderNumber: string, next: OrderStatus) {
  const order = await tx.order.findUnique({ where: { orderNumber }, include: { items: true } })
  if (!order) throw new OrderError('Pesanan tidak ditemukan.', 404)
  if (!canTransition(order.status, next)) {
    throw new OrderError(`Pesanan berstatus "${statusLabel(order.status)}" tidak bisa diubah menjadi "${statusLabel(next)}".`, 409)
  }

  if (next === 'CANCELLED') await cancelOrder(tx, order)
  else if (next === 'PAID') await markOrderPaid(tx, order, `MANUAL-${randomBytes(6).toString('hex').toUpperCase()}`)
  else await transition(tx, order.id, order.status, { status: next })

  return tx.order.findUniqueOrThrow({ where: { id: order.id } })
}

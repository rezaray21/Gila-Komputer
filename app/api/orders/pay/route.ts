import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { forbiddenOrigin, sameOrigin } from '@/lib/api-guard'
import { canAccessOrder, cancelOrder, markOrderPaid, OrderError } from '@/lib/order-service'
import { findPaymentMethod } from '@/lib/payment-methods'

// ============================================================================
// SIMULASI PAYMENT GATEWAY — TIDAK terhubung ke provider sungguhan.
// Alur: order dibuat (PENDING) -> client memanggil endpoint ini untuk
// "membayar" -> status berubah ke PAID + paymentRef + paidAt.
// Untuk integrasi asli, ganti bagian ini dengan webhook/callback Midtrans/Xendit.
//
// Akses: pemilik akun (sesi login) ATAU pemegang payToken (pembeli tamu).
// Selain itu dijawab "Pesanan tidak ditemukan" agar nomor pesanan tidak bisa ditebak-tebak.
// ============================================================================

const randomHex = (bytes: number) => randomBytes(bytes).toString('hex')

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin()

  let body: { orderNumber?: unknown; action?: unknown; payToken?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Data pembayaran tidak valid.' }, { status: 400 })
  }

  const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : ''
  const payToken = typeof body.payToken === 'string' ? body.payToken : undefined
  const action = body.action === 'cancel' ? 'cancel' : 'pay' // default: bayar
  if (!orderNumber) return NextResponse.json({ error: 'Nomor pesanan wajib diisi.' }, { status: 400 })

  const user = await getCurrentUser()

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findUnique({ where: { orderNumber }, include: { items: true } })
      if (!order || !canAccessOrder(order, user, payToken)) throw new OrderError('Pesanan tidak ditemukan.', 404)
      if (order.status !== 'PENDING') throw new OrderError(`Pesanan sudah ${order.status.toLowerCase()} dan tidak dapat diubah.`)

      if (action === 'cancel') {
        // Kembalikan stok karena pesanan dibatalkan sebelum dibayar.
        await cancelOrder(transaction, order)
      } else {
        const method = order.paymentMethod ? findPaymentMethod(order.paymentMethod) : undefined
        if (!method) throw new OrderError('Metode pembayaran pada pesanan tidak dikenali.')

        // ---- Di sinilah simulasi terjadi ----
        // Gateway asli: buat billing token / VA number lalu tunggu webhook `settlement`.
        // Simulasi: langsung dianggap sukses dengan nomor referensi acak.
        const paymentRef = `${method.code.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${randomHex(8).toUpperCase()}`
        await markOrderPaid(transaction, order, paymentRef)
      }

      return transaction.order.findUniqueOrThrow({ where: { id: order.id } })
    })

    return NextResponse.json({
      order: {
        orderNumber: result.orderNumber,
        status: result.status,
        total: result.total,
        paymentMethod: result.paymentMethod,
        paymentRef: result.paymentRef,
        paidAt: result.paidAt,
      },
    })
  } catch (error) {
    if (error instanceof OrderError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error('[orders/pay]', error)
    return NextResponse.json({ error: 'Pembayaran gagal diproses.' }, { status: 500 })
  }
}

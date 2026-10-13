import { randomInt } from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { forbiddenOrigin, sameOrigin } from '@/lib/api-guard'
import { newPayToken } from '@/lib/order-service'
import { findPaymentMethod } from '@/lib/payment-methods'

type OrderRequestItem = { productId: number; quantity: number }

type OrderRequest = {
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  shippingMethod: 'regular' | 'express'
  paymentMethod: string
  items: OrderRequestItem[]
}

const shippingFees = { regular: 25000, express: 50000 }

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin()

  let body: OrderRequest

  try {
    body = await request.json() as OrderRequest
  } catch {
    return NextResponse.json({ error: 'Data checkout tidak valid.' }, { status: 400 })
  }

  const requiredFields = [body.customerName, body.email, body.phone, body.address, body.city, body.postalCode]
  if (requiredFields.some((value) => typeof value !== 'string' || !value.trim()) || !isValidEmail(body.email)) {
    return NextResponse.json({ error: 'Lengkapi data customer dengan format yang benar.' }, { status: 400 })
  }

  if (!body.items?.length || !['regular', 'express'].includes(body.shippingMethod)) {
    return NextResponse.json({ error: 'Keranjang atau metode pengiriman tidak valid.' }, { status: 400 })
  }

  const paymentMethod = typeof body.paymentMethod === 'string' ? findPaymentMethod(body.paymentMethod.trim().toLowerCase()) : undefined
  if (!paymentMethod) {
    return NextResponse.json({ error: 'Metode pembayaran tidak dikenali.' }, { status: 400 })
  }

  const requestedItems = body.items.map((item) => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
  }))
  if (requestedItems.some((item) => !Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return NextResponse.json({ error: 'Jumlah produk tidak valid.' }, { status: 400 })
  }

  // Checkout tamu tetap diizinkan: bila ada sesi login, pesanan dikaitkan ke akun itu (userId dari sesi, bukan dari klien).
  const user = await getCurrentUser()
  const payToken = newPayToken()

  const itemMap = new Map<number, number>()
  for (const item of requestedItems) itemMap.set(item.productId, (itemMap.get(item.productId) ?? 0) + item.quantity)
  const productIds = [...itemMap.keys()]

  try {
    const order = await prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({ where: { id: { in: productIds }, status: 'ACTIVE' } })
      if (products.length !== productIds.length) throw new Error('Salah satu produk sudah tidak tersedia.')

      const orderItems = products.map((product) => {
        const quantity = itemMap.get(product.id) ?? 0
        if (product.stock < quantity) throw new Error(`Stok ${product.name} tidak mencukupi.`)
        return { productId: product.id, name: product.name, quantity, unitPrice: product.price }
      })
      const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      const shippingFee = shippingFees[body.shippingMethod]
      const orderNumber = `GK-${Date.now()}-${randomInt(0, 1000).toString().padStart(3, '0')}`

      for (const item of orderItems) {
        const updated = await transaction.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity }, status: 'ACTIVE' }, data: { stock: { decrement: item.quantity } } })
        if (updated.count !== 1) throw new Error(`Stok ${item.name} baru saja berubah. Silakan coba lagi.`)
      }

      return transaction.order.create({
        data: {
          orderNumber,
          customerName: body.customerName.trim(),
          email: body.email.trim().toLowerCase(),
          phone: body.phone.trim(),
          address: body.address.trim(),
          city: body.city.trim(),
          postalCode: body.postalCode.trim(),
          shippingMethod: body.shippingMethod,
          shippingFee,
          subtotal,
          total: subtotal + shippingFee,
          paymentMethod: paymentMethod.code,
          userId: user?.id ?? null,
          payToken,
          items: { create: orderItems },
        },
        include: { items: true },
      })
    })

    return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber, total: order.total, status: order.status, paymentMethod: order.paymentMethod, payToken } }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order tidak dapat dibuat.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

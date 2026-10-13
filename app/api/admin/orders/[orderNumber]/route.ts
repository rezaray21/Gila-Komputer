import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guardAdminRequest } from '@/lib/api-guard'
import { changeOrderStatus, OrderError } from '@/lib/order-service'
import { isOrderStatus } from '@/lib/order-status'

type Context = { params: Promise<{ orderNumber: string }> }

export async function PATCH(request: Request, { params }: Context) {
  const guard = await guardAdminRequest(request)
  if (guard instanceof NextResponse) return guard

  const { orderNumber } = await params
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null
  if (!body || !isOrderStatus(body.status)) return NextResponse.json({ error: 'Status tujuan tidak valid.' }, { status: 400 })
  const nextStatus = body.status

  try {
    const order = await prisma.$transaction((tx) => changeOrderStatus(tx, decodeURIComponent(orderNumber), nextStatus))
    return NextResponse.json({ order: { orderNumber: order.orderNumber, status: order.status } })
  } catch (error) {
    if (error instanceof OrderError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error('[admin/orders]', error)
    return NextResponse.json({ error: 'Status pesanan tidak dapat diubah.' }, { status: 500 })
  }
}

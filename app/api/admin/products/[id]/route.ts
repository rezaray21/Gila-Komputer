import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guardAdminRequest } from '@/lib/api-guard'
import { productErrorResponse, resolveBrandId, resolveCategoryId } from '@/lib/admin-products'
import { parseProductInput } from '@/lib/product-input'

type Context = { params: Promise<{ id: string }> }

const parseId = (value: string) => (/^\d+$/.test(value) ? Number(value) : null)

export async function PATCH(request: Request, { params }: Context) {
  const guard = await guardAdminRequest(request)
  if (guard instanceof NextResponse) return guard

  const id = parseId((await params).id)
  if (!id) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 })

  const parsed = parseProductInput(await request.json().catch(() => null))
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { category, brand, ...data } = parsed.data

  try {
    const product = await prisma.$transaction(async (tx) => {
      if (!(await tx.product.findUnique({ where: { id }, select: { id: true } }))) return null
      return tx.product.update({ where: { id }, data: { ...data, categoryId: await resolveCategoryId(tx, category), brandId: await resolveBrandId(tx, brand) } })
    })
    if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 })
    return NextResponse.json({ product: { id: product.id, slug: product.slug } })
  } catch (error) {
    return productErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const guard = await guardAdminRequest(request)
  if (guard instanceof NextResponse) return guard

  const id = parseId((await params).id)
  if (!id) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 })

  // Produk yang pernah dipesan tidak boleh dihapus (riwayat order mereferensikannya) — nonaktifkan saja.
  if ((await prisma.orderItem.count({ where: { productId: id } })) > 0) {
    return NextResponse.json({ error: 'Produk ini sudah pernah dipesan sehingga tidak bisa dihapus. Ubah statusnya menjadi Nonaktif.' }, { status: 409 })
  }

  try {
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return productErrorResponse(error)
  }
}

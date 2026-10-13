import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guardAdminRequest } from '@/lib/api-guard'
import { productErrorResponse, resolveBrandId, resolveCategoryId } from '@/lib/admin-products'
import { parseProductInput } from '@/lib/product-input'

export async function POST(request: Request) {
  const guard = await guardAdminRequest(request)
  if (guard instanceof NextResponse) return guard

  const parsed = parseProductInput(await request.json().catch(() => null))
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { category, brand, ...data } = parsed.data

  try {
    const product = await prisma.$transaction(async (tx) =>
      tx.product.create({ data: { ...data, categoryId: await resolveCategoryId(tx, category), brandId: await resolveBrandId(tx, brand) } }),
    )
    return NextResponse.json({ product: { id: product.id, slug: product.slug } }, { status: 201 })
  } catch (error) {
    return productErrorResponse(error)
  }
}

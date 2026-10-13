import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import type { ParsedProduct } from '@/lib/product-input'

type Tx = Prisma.TransactionClient

export class ProductInputError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

export async function resolveCategoryId(tx: Tx, category: ParsedProduct['category']) {
  if ('name' in category) return (await tx.category.upsert({ where: { name: category.name }, update: {}, create: { name: category.name } })).id
  if (!(await tx.category.findUnique({ where: { id: category.id } }))) throw new ProductInputError('Kategori tidak ditemukan.')
  return category.id
}

export async function resolveBrandId(tx: Tx, brand: ParsedProduct['brand']) {
  if (!brand) return null
  if ('name' in brand) return (await tx.brand.upsert({ where: { name: brand.name }, update: {}, create: { name: brand.name } })).id
  if (!(await tx.brand.findUnique({ where: { id: brand.id } }))) throw new ProductInputError('Merek tidak ditemukan.')
  return brand.id
}

export function productErrorResponse(error: unknown) {
  if (error instanceof ProductInputError) return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return NextResponse.json({ error: 'Slug sudah dipakai produk lain. Ubah slug-nya.' }, { status: 409 })
  }
  console.error('[admin/products]', error)
  return NextResponse.json({ error: 'Produk tidak dapat disimpan.' }, { status: 500 })
}

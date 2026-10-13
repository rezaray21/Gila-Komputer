import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guardAdminRequest } from '@/lib/api-guard'
import type { Role } from '@/lib/auth'

const ROLES: Role[] = ['PEMBELI', 'ADMIN']

// PATCH /api/admin/users/:id/role  body: { role: 'PEMBELI' | 'ADMIN' }
// Hanya admin (guardAdminRequest); admin tidak boleh menurunkan peran dirinya sendiri
// supaya tidak ada akun yang terkunci dari panel /admin.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardAdminRequest(request)
  if (guard instanceof NextResponse) return guard

  const id = Number.parseInt((await params).id, 10)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 })
  }

  const role = typeof body.role === 'string' ? body.role : ''
  if (!ROLES.includes(role as Role)) return NextResponse.json({ error: 'Peran tidak dikenali.' }, { status: 400 })
  if (id === guard.id && role !== 'ADMIN') return NextResponse.json({ error: 'Anda tidak dapat menurunkan peran sendiri.' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
  if (!target) return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 })
  if (target.role === role) return NextResponse.json({ user: { id, role } })

  await prisma.user.update({ where: { id }, data: { role } })
  // Sesi lama tetap berlaku, tetapi peran dibaca ulang dari database di setiap request,
  // jadi perubahan langsung terasa tanpa perlu login ulang.
  return NextResponse.json({ user: { id, role } })
}

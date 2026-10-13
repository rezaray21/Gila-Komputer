import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { hashSessionToken, looksLikeSessionToken, newSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session-token'

export type Role = 'PEMBELI' | 'ADMIN'
export type SessionUser = { id: number; name: string; email: string; phone: string | null; role: Role }

// Hash bcrypt valid (bukan milik siapa pun). Dipakai agar waktu respon login tetap
// sama baik email terdaftar maupun tidak, sehingga email tidak bisa ditebak dari waktunya.
export const DUMMY_PASSWORD_HASH = '$2b$12$TK99wfQ2sVVRcKNEuCwvy.o1t6z0oWQoxXeVLmAhQWzRhK8ZbKoG2'

export const hashPassword = (password: string) => bcrypt.hash(password, 12)
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash)

export async function startSession(userId: number) {
  const token = newSessionToken()
  const now = Date.now()
  await prisma.session.create({ data: { id: hashSessionToken(token), userId, expiresAt: new Date(now + SESSION_MAX_AGE * 1000) } })
  // Bersihkan sesi kedaluwarsa milik siapa pun, sekali tiap ada login baru.
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date(now) } } })
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

// Logout menghapus sesi di server, bukan hanya cookie di browser, jadi token yang sudah disalin tidak berlaku lagi.
export async function endSession() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (looksLikeSessionToken(token)) await prisma.session.deleteMany({ where: { id: hashSessionToken(token) } })
  store.delete(SESSION_COOKIE)
}

// Selalu membaca sesi dan user dari database, jadi role tidak pernah "basi" dan sesi yang dicabut langsung tidak berlaku.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!looksLikeSessionToken(token)) return null
  const session = await prisma.session.findUnique({
    where: { id: hashSessionToken(token) },
    include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } },
  })
  if (!session) return null
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { id: session.id } })
    return null
  }
  const { user } = session
  return { ...user, role: user.role === 'ADMIN' ? 'ADMIN' : 'PEMBELI' }
})

export async function requireUser(nextPath = '/akun') {
  const user = await getCurrentUser()
  if (!user) redirect(`/masuk?next=${encodeURIComponent(nextPath)}`)
  return user
}

// Pemeriksaan utama untuk halaman admin (proxy.ts hanya pengalihan cepat).
// Non-admin mendapat 404 supaya keberadaan /admin tidak terlihat.
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) redirect('/masuk?next=/admin')
  if (user.role !== 'ADMIN') notFound()
  return user
}

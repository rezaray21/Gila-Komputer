import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DUMMY_PASSWORD_HASH, startSession, verifyPassword } from '@/lib/auth'
import { forbiddenOrigin, sameOrigin } from '@/lib/api-guard'
import { clientIp, hit, isLimited, reset } from '@/lib/rate-limit'
import { normalizeEmail, safeNextPath } from '@/lib/validation'

const MAX_FAILED_ATTEMPTS = 5
const LOCK_WINDOW_MS = 15 * 60 * 1000

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin()

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Data login tidak valid.' }, { status: 400 })
  }

  const email = normalizeEmail(body.email)
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email || !password || password.length > 200) return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 })

  const rateKey = `login|${clientIp(request)}|${email}`
  if (isLimited(rateKey, MAX_FAILED_ATTEMPTS)) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.' }, { status: 429 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  // Selalu jalankan satu perbandingan bcrypt, agar email terdaftar/tidak tidak terbaca dari waktu respon.
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH)
  if (!user || !passwordOk) {
    hit(rateKey, LOCK_WINDOW_MS)
    return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 })
  }

  reset(rateKey)
  await startSession(user.id)
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, redirectTo: safeNextPath(body.next, user.role === 'ADMIN' ? '/admin' : '/akun') })
}

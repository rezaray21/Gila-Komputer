import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hashPassword, startSession } from '@/lib/auth'
import { forbiddenOrigin, sameOrigin } from '@/lib/api-guard'
import { clientIp, hit, isLimited } from '@/lib/rate-limit'
import { normalizeEmail, normalizeName, validateEmail, validateName, validateOptionalPhone, validatePassword } from '@/lib/validation'

const REGISTER_LIMIT = 10
const REGISTER_WINDOW_MS = 60 * 60 * 1000

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin()

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Data pendaftaran tidak valid.' }, { status: 400 })
  }

  const rateKey = `register|${clientIp(request)}`
  if (isLimited(rateKey, REGISTER_LIMIT)) return NextResponse.json({ error: 'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.' }, { status: 429 })

  // Role TIDAK pernah dibaca dari body: semua pendaftaran publik menjadi PEMBELI.
  const name = normalizeName(body.name)
  const email = normalizeEmail(body.email)
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  const fieldErrors: Record<string, string> = {}
  const nameError = validateName(name)
  const emailError = validateEmail(email)
  const phoneError = validateOptionalPhone(phone)
  const passwordError = validatePassword(password)
  if (nameError) fieldErrors.name = nameError
  if (emailError) fieldErrors.email = emailError
  if (phoneError) fieldErrors.phone = phoneError
  if (passwordError) fieldErrors.password = passwordError
  if (!passwordError && password.toLowerCase().includes(email.split('@')[0]) && email.split('@')[0].length >= 4) fieldErrors.password = 'Password jangan memuat bagian dari email.'
  if (Object.keys(fieldErrors).length) return NextResponse.json({ error: 'Periksa kembali data yang diisi.', fieldErrors }, { status: 400 })

  hit(rateKey, REGISTER_WINDOW_MS)

  try {
    const user = await prisma.user.create({
      data: { name, email, phone: phone || null, passwordHash: await hashPassword(password), role: 'PEMBELI' },
      select: { id: true, name: true, email: true, role: true },
    })
    await startSession(user.id)
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email ini sudah terdaftar. Silakan masuk.', fieldErrors: { email: 'Email sudah terdaftar.' } }, { status: 409 })
    }
    console.error('[auth/register]', error)
    return NextResponse.json({ error: 'Pendaftaran gagal. Coba lagi.' }, { status: 500 })
  }
}

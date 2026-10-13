import { NextResponse } from 'next/server'
import { getCurrentUser, type SessionUser } from '@/lib/auth'

// Tolak request lintas-origin (lapisan tambahan di atas cookie SameSite=Lax).
// Request tanpa header Origin (curl, server-to-server) dibiarkan lewat karena bukan serangan browser.
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export const forbiddenOrigin = () => NextResponse.json({ error: 'Permintaan ditolak.' }, { status: 403 })

// Dipakai di setiap route handler /api/admin/*: mengembalikan user admin, atau response error yang siap dikirim.
export async function guardAdminRequest(request: Request): Promise<SessionUser | NextResponse> {
  if (!sameOrigin(request)) return forbiddenOrigin()
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 })
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 })
  return user
}

// Sama seperti guardAdminRequest, tetapi mengembalikan NextResponse saat berhasil sehingga
// `if (guard instanceof NextResponse) return guard` tetap valid di TypeScript (tidak pernah mengembalikan SessionUser).
export async function guardAdminOnly(request: Request): Promise<NextResponse> {
  const guard = await guardAdminRequest(request)
  if (guard instanceof NextResponse) return guard
  return NextResponse.json({ ok: true })
}

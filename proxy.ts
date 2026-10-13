import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { looksLikeSessionToken, SESSION_COOKIE } from './lib/session-token'

// Pengalihan cepat: pengunjung tanpa cookie sesi diarahkan ke halaman masuk.
// Ini BUKAN pemeriksaan akses: proxy tidak membuka database, jadi keabsahan sesi dan role admin
// dicek ulang di app/admin/layout.tsx, app/akun/*, dan setiap route handler /api/admin/*
// (lihat lib/auth.ts dan lib/api-guard.ts).
export function proxy(request: NextRequest) {
  if (looksLikeSessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next()

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/masuk'
  loginUrl.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/akun/:path*'],
}

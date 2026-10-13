import { createHash, randomBytes } from 'node:crypto'

// Sesi login memakai token acak 256-bit di cookie. Yang disimpan di tabel Session hanyalah
// hash SHA-256-nya, sehingga isi database saja tidak cukup untuk membajak sesi.
// File ini tidak mengimpor Prisma supaya ringan dan mudah diuji.

export const SESSION_COOKIE = 'gk_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 hari, dalam detik

export const newSessionToken = () => randomBytes(32).toString('base64url') // 43 karakter
export const hashSessionToken = (token: string) => createHash('sha256').update(token).digest('hex')

// Pemeriksaan bentuk saja (bukan keabsahan) agar cookie sampah tidak sampai ke database.
export const looksLikeSessionToken = (value?: string | null): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value)

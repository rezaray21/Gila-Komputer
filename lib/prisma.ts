import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

// Next.js hanya memuat .env / .env.local secara otomatis bila dotenv terpasang.
// Bila tidak ada, baca sendiri supaya DATABASE_URL selalu tersedia saat dev/build.
if (!process.env.DATABASE_URL) {
  for (const f of ['.env', '.env.local']) {
    const p = path.resolve(process.cwd(), f)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
      }
    }
    if (process.env.DATABASE_URL) break
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL belum di set. Buat file .env di folder project (salin dari .env.example), ' +
      'lalu isi, contoh: DATABASE_URL="mysql://root:@localhost:3306/gilakomputer_db", ' +
      'kemudian jalankan ulang `npm run dev`.'
    )
  }
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Membuat (atau menjadikan) akun ADMIN dari terminal — admin tidak bisa dibuat lewat pendaftaran publik.
//
//   ADMIN_EMAIL=admin@toko.id ADMIN_PASSWORD='Rahasia123' ADMIN_NAME='Admin Toko' npm run admin:create
//
// Nilai juga boleh ditaruh di file .env. Bila email sudah terdaftar, akun itu dijadikan ADMIN
// dan password-nya diganti.
import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { normalizeEmail, normalizeName, validateEmail, validateName, validatePassword } from '../lib/validation'

// Sama seperti prisma.config.ts: baca .env sendiri karena tsx tidak memuatnya otomatis.
for (const file of ['.env', '.env.local']) {
  const filePath = path.resolve(process.cwd(), file)
  if (!fs.existsSync(filePath)) continue
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

const prisma = new PrismaClient()

async function main() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL)
  const name = normalizeName(process.env.ADMIN_NAME || 'Admin')
  const password = process.env.ADMIN_PASSWORD ?? ''

  const problem = validateEmail(email) ?? validateName(name) ?? validatePassword(password)
  if (problem) {
    console.error(`Gagal: ${problem}\nIsi ADMIN_EMAIL, ADMIN_PASSWORD (min. 8 karakter, huruf + angka), dan opsional ADMIN_NAME.`)
    process.exitCode = 1
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const existing = await prisma.user.findUnique({ where: { email } })
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: 'ADMIN' },
    create: { name, email, passwordHash, role: 'ADMIN' },
  })
  console.log(existing ? `Akun ${email} dijadikan ADMIN dan password-nya diperbarui.` : `Admin ${email} berhasil dibuat.`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())

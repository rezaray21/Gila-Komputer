import Link from 'next/link'
import { redirect } from 'next/navigation'
import BrandMark from '@/components/BrandMark'
import AuthForm from '@/components/AuthForm'
import { getCurrentUser } from '@/lib/auth'
import { safeNextPath } from '@/lib/validation'

export const metadata = { title: 'Masuk / Gila Komputer' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNextPath((await searchParams).next)
  const user = await getCurrentUser()
  if (user) redirect(next)

  return (
    <main className="catalog-page auth-page">
      <nav className="site-nav page-width catalog-nav"><BrandMark /><Link href="/products" className="text-link">← Kembali belanja</Link></nav>
      <div className="page-width auth-layout">
        <div className="auth-intro"><p className="eyebrow">Gila Komputer / akun</p><h1>Masuk ke<br /><em>akunmu.</em></h1><p>Lihat riwayat pesanan, lanjutkan pembayaran, dan isi data checkout otomatis.</p></div>
        <AuthForm mode="login" next={next} />
      </div>
    </main>
  )
}

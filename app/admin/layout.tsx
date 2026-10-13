import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import AdminNav from '@/components/AdminNav'
import LogoutButton from '@/components/LogoutButton'
import { requireAdmin } from '@/lib/auth'

export const metadata = { title: 'Admin / Gila Komputer', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Pemeriksaan akses utama untuk seluruh halaman /admin (proxy.ts hanyalah pengalihan cepat).
  const admin = await requireAdmin()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <BrandMark compact />
        <p className="eyebrow">Panel admin</p>
        <AdminNav />
        <div className="admin-sidebar-foot">
          <Link href="/" className="text-link">Lihat toko ↗</Link>
          <p>{admin.name}<small>{admin.email}</small></p>
          <LogoutButton className="admin-logout" />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}

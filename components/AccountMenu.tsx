import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'

// Server component: dipasang di navigasi setiap halaman publik.
export default async function AccountMenu() {
  const user = await getCurrentUser()
  if (!user) return <div className="nav-account-group"><Link href="/masuk" className="nav-account">Masuk</Link><Link href="/daftar" className="nav-account">Daftar</Link></div>
  return <div className="nav-account-group">
    <Link href="/akun" className="nav-account" title={user.email}>{user.name.split(' ')[0]}</Link>
    {user.role === 'ADMIN' && <Link href="/admin" className="nav-account">Admin</Link>}
    <LogoutButton />
  </div>
}

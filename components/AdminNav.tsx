'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Ringkasan', exact: true },
  { href: '/admin/products', label: 'Produk' },
  { href: '/admin/orders', label: 'Pesanan' },
  { href: '/admin/users', label: 'Pengguna' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return <nav className="admin-nav" aria-label="Menu admin">
    {links.map((link) => {
      const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
      return <Link key={link.href} href={link.href} className={active ? 'is-active' : undefined} aria-current={active ? 'page' : undefined}>{link.label}</Link>
    })}
  </nav>
}

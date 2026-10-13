import Pagination from '@/components/Pagination'
import UserRoleToggle from '@/components/UserRoleToggle'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/format'
import { requireAdmin } from '@/lib/auth'

const PAGE_SIZE = 25

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const admin = await requireAdmin()
  const currentPage = Math.max(1, Number.parseInt((await searchParams).page ?? '1', 10) || 1)
  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, skip: (currentPage - 1) * PAGE_SIZE, take: PAGE_SIZE, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { orders: true } } } }),
  ])

  return <>
    <header className="admin-header"><div><p className="eyebrow">Akun terdaftar</p><h1>Pengguna</h1></div></header>
    <p className="admin-muted">{total} akun. Admin baru juga bisa dibuat lewat terminal dengan <code>npm run admin:create</code>. Ubah peran pembeli menjadi admin dari tombol di bawah.</p>
    {users.length === 0 ? <div className="admin-empty"><p>Belum ada akun.</p></div> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Nama</th><th>Email</th><th>Telepon</th><th>Peran</th><th className="num">Pesanan</th><th>Bergabung</th><th>Aksi</th></tr></thead>
      <tbody>{users.map((user) => <tr key={user.id}>
        <td><strong>{user.name}</strong></td><td>{user.email}</td><td>{user.phone ?? '-'}</td>
        <td><span className={user.role === 'ADMIN' ? 'status-badge status-paid' : 'status-badge status-pending'}>{user.role === 'ADMIN' ? 'Admin' : 'Pembeli'}</span></td>
        <td className="num">{user._count.orders}</td><td>{formatDate(user.createdAt)}</td>
        <td><UserRoleToggle userId={user.id} role={user.role} currentAdminId={admin.id} /></td>
      </tr>)}</tbody>
    </table></div>}
    <Pagination basePath="/admin/users" params={{}} page={currentPage} totalPages={Math.ceil(total / PAGE_SIZE)} />
  </>
}

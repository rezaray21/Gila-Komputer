'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

// Tombol "Jadikan Admin" / "Turunkan ke Pembeli" di halaman /admin/users.
// Peran selalu diverifikasi ulang di server (guardAdminRequest), ini hanya UI-nya.
export default function UserRoleToggle({ userId, role, currentAdminId }: { userId: number; role: string; currentAdminId: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const isAdmin = role === 'ADMIN'
  // Admin tidak boleh menurunkan dirinya sendiri (sudah dijaga juga di server).
  const isSelf = userId === currentAdminId

  async function toggle() {
    const nextRole = isAdmin ? 'PEMBELI' : 'ADMIN'
    if (!window.confirm(isAdmin ? `Turunkan akun ini menjadi pembeli?` : `Jadikan akun ini admin?`)) return
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: nextRole }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      window.alert(data?.error ?? 'Perubahan peran gagal.')
      return
    }
    startTransition(() => router.refresh())
  }

  if (isSelf && isAdmin) return <span className="admin-muted">Anda</span>
  return (
    <button type="button" className={isAdmin ? 'button-quiet is-destructive' : 'button button-dark button-small'} onClick={toggle} disabled={pending}>
      {pending ? 'Memproses…' : isAdmin ? 'Turunkan ke Pembeli' : 'Jadikan Admin'}
    </button>
  )
}

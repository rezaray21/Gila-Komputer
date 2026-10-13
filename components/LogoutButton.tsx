'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PAYMENT_STORAGE_KEY } from '@/components/PaymentSimulator'

export default function LogoutButton({ className = 'nav-account' }: { className?: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const logout = async () => {
    setBusy(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      // Sesi pembayaran yang tersimpan di browser ikut dibersihkan agar tidak terbawa ke pengguna berikutnya.
      window.localStorage.removeItem(PAYMENT_STORAGE_KEY)
      router.push('/')
      router.refresh()
    }
  }

  return <button type="button" className={className} onClick={logout} disabled={busy}>{busy ? 'Keluar…' : 'Keluar'}</button>
}

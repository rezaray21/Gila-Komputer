'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Action = { status: string; label: string; destructive: boolean }

export default function AdminOrderActions({ orderNumber, actions }: { orderNumber: string; actions: Action[] }) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (!actions.length) return <p className="admin-muted">Pesanan ini sudah final, tidak ada perubahan status lagi.</p>

  const apply = async (status: string) => {
    setPending(status)
    setError('')
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Status tidak dapat diubah.')
      setConfirming(null)
      router.refresh()
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : 'Status tidak dapat diubah.')
    } finally {
      setPending(null)
    }
  }

  return <div className="admin-actions">
    <div className="admin-action-buttons">
      {actions.map((action) => confirming === action.status
        ? <span className="admin-confirm" key={action.status}>Yakin? Stok dikembalikan.<button type="button" className="button-danger" onClick={() => apply(action.status)} disabled={pending !== null}>{pending === action.status ? 'Memproses…' : 'Ya, batalkan'}</button><button type="button" className="button-quiet" onClick={() => setConfirming(null)}>Tidak jadi</button></span>
        : <button key={action.status} type="button" className={action.destructive ? 'button-quiet is-destructive' : 'button button-dark button-small'} disabled={pending !== null} onClick={() => action.destructive ? setConfirming(action.status) : apply(action.status)}>{pending === action.status ? 'Memproses…' : action.label}</button>)}
    </div>
    {error && <p className="checkout-error" role="alert">{error}</p>}
  </div>
}

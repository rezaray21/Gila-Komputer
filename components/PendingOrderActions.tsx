'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PAYMENT_STORAGE_KEY } from '@/components/PaymentSimulator'

type Props = { orderNumber: string; total: number; paymentMethodCode: string }

// Aksi untuk pesanan yang belum dibayar, dari halaman riwayat pesanan pembeli.
export default function PendingOrderActions({ orderNumber, total, paymentMethodCode }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const continuePayment = () => {
    // Checkout memulihkan sesi pembayaran dari localStorage dan langsung menampilkan simulator.
    window.localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify({ orderNumber, total, paymentMethodCode }))
    router.push('/checkout')
  }

  const cancel = async () => {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/orders/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNumber, action: 'cancel' }) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Pesanan tidak dapat dibatalkan.')
      window.localStorage.removeItem(PAYMENT_STORAGE_KEY)
      router.refresh()
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Pesanan tidak dapat dibatalkan.')
      setConfirming(false)
    } finally {
      setBusy(false)
    }
  }

  return <div className="order-actions">
    <button type="button" className="button button-dark" onClick={continuePayment}>Lanjutkan pembayaran <span>→</span></button>
    {confirming
      ? <div className="payment-cancel-confirm"><span>Yakin batalkan pesanan? Stok akan dikembalikan.</span><div><button type="button" className="payment-cancel-yes" onClick={cancel} disabled={busy}>{busy ? 'Membatalkan…' : 'Ya, batalkan'}</button><button type="button" className="payment-cancel-no" onClick={() => setConfirming(false)}>Tidak jadi</button></div></div>
      : <button type="button" className="payment-cancel" onClick={() => setConfirming(true)}>Batalkan pesanan</button>}
    {error && <p className="checkout-error" role="alert">{error}</p>}
  </div>
}

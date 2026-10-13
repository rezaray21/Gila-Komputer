'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { findPaymentMethod, formatIDR, getPaymentInstructions, type PaymentInstruction } from '@/lib/payment-methods'

type SimOrder = { orderNumber: string; total: number; paymentMethodCode: string; payToken?: string }
type Phase = 'instruction' | 'processing' | 'success' | 'expired'

const PAYMENT_STORAGE_KEY = 'gila-komputer-last-payment'
const EXPIRY_SECONDS = 15 * 60 // batas bayar ala gateway: 15 menit
const PROCESSING_STEPS = ['Menghubungkan ke simulator…', 'Menunggu konfirmasi transaksi…', 'Memverifikasi pembayaran…']

// Salin nilai ke clipboard (fallback untuk browser lama / http non-secure).
async function copyText(value: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(value); return true }
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch { return false }
}

// Layar simulasi pembayaran: instruksi + salin angka -> "sudah bayar" -> loading gateway bertahap -> struk sukses.
export default function PaymentSimulator({ order, onDone }: { order: SimOrder; onDone?: () => void }) {
  const method = findPaymentMethod(order.paymentMethodCode)
  const [phase, setPhase] = useState<Phase>('instruction')
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS)
  const [paymentRef, setPaymentRef] = useState('')
  const [paidAt, setPaidAt] = useState('')
  const [stepIndex, setStepIndex] = useState(0)
  const [copiedKey, setCopiedKey] = useState('')
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const timers = useRef<number[]>([])

  // Countdown + auto-expire.
  useEffect(() => {
    if (phase !== 'instruction') return
    const timer = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [phase])
  useEffect(() => { if (phase === 'instruction' && secondsLeft === 0) setPhase('expired') }, [phase, secondsLeft])

  // Animasi step verifikasi ala gateway.
  useEffect(() => {
    if (phase !== 'processing') return
    const stepper = window.setInterval(() => setStepIndex((current) => Math.min(current + 1, PROCESSING_STEPS.length - 1)), 900)
    return () => window.clearInterval(stepper)
  }, [phase])

  // Bersihkan timer tertunda saat unmount.
  useEffect(() => () => { timers.current.forEach((id) => window.clearTimeout(id)) }, [])

  if (!method) return null

  const instructions: PaymentInstruction[] = getPaymentInstructions(method, order.orderNumber).map((line) => (line.label === 'Jumlah' ? { ...line, value: formatIDR(order.total) } : line))
  const countdown = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`
  const isLowTime = secondsLeft <= 5 * 60

  const handleCopy = async (key: string, value: string) => {
    const ok = await copyText(value)
    if (ok) {
      setCopiedKey(key)
      const timer = window.setTimeout(() => setCopiedKey(''), 1800)
      timers.current.push(timer)
    }
  }

  const confirmPayment = async () => {
    setPhase('processing')
    setStepIndex(0)
    setError('')
    try {
      const response = await fetch('/api/orders/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNumber: order.orderNumber, payToken: order.payToken }) })
      const result = await response.json() as { order?: { paymentRef: string; paidAt?: string }; error?: string }
      if (!response.ok || !result.order) throw new Error(result.error ?? 'Pembayaran gagal diproses.')
      // Tahan sejenak agar animasi verifikasi terasa seperti gateway sungguhan.
      await new Promise((resolve) => { const id = window.setTimeout(resolve, 1200); timers.current.push(id) })
      setPaymentRef(result.order.paymentRef)
      setPaidAt(result.order.paidAt ? new Date(result.order.paidAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }))
      setPhase('success')
      onDone?.()
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : 'Pembayaran gagal diproses.')
      setPhase('instruction')
    }
  }

  const cancelOrder = async () => {
    setError('')
    setCancelling(true)
    try {
      const response = await fetch('/api/orders/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNumber: order.orderNumber, action: 'cancel', payToken: order.payToken }) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Pesanan tidak dapat dibatalkan.')
      onDone?.()
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Pesanan tidak dapat dibatalkan.')
      setConfirmCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  const categoryLabel = method.category === 'ewallet' ? 'E-Wallet' : method.category === 'bank' ? 'Transfer Bank' : 'Virtual Account'

  return <section className="payment-sim" style={{ ['--pay-accent' as string]: method.color }} aria-live="polite">
    <header className="payment-sim-head">
      <div>
        <p className="eyebrow">{categoryLabel} · Mode Simulasi</p>
        <h3><span className="payment-brand-badge" style={{ background: method.color }}>{method.icon}</span> Bayar dengan {method.name}</h3>
      </div>
      {phase === 'instruction' && <div className={`payment-countdown${isLowTime ? ' is-low' : ''}`}><small>Bayar dalam</small><strong>{countdown}</strong></div>}
    </header>

    {phase === 'instruction' && <>
      <div className="payment-amount"><span>Total yang harus dibayar</span><strong>{formatIDR(order.total)}</strong></div>
      <ol className="payment-steps">
        <li><b>1</b><span>Salin nomor tujuan di bawah ini</span></li>
        <li><b>2</b><span>Transfer / bayar lewat aplikasi {method.name} dengan nominal yang <em>persis sama</em></span></li>
        <li><b>3</b><span>Kembali ke halaman ini dan tekan <strong>Saya sudah bayar</strong></span></li>
      </ol>
      <ul className="payment-instructions">
        <li>
          <span>Nomor pesanan</span>
          <div className="payment-value"><strong>{order.orderNumber}</strong><button type="button" className="payment-copy" onClick={() => handleCopy('order', order.orderNumber)} aria-label={`Salin nomor pesanan ${order.orderNumber}`}>{copiedKey === 'order' ? '✓ Tersalin' : '⧉ Salin'}</button></div>
        </li>
        {instructions.map((line) => <li key={line.label}>
          <span>{line.label}</span>
          <div className="payment-value"><strong>{line.value}</strong><button type="button" className="payment-copy" onClick={() => handleCopy(line.label, line.value)} aria-label={`Salin ${line.label}`}>{copiedKey === line.label ? '✓ Tersalin' : '⧉ Salin'}</button></div>
        </li>)}
      </ul>
      <p className="payment-note">🧪 Mode simulasi: tombol di bawah langsung menandai pesanan lunas tanpa memotong saldo/rekening mana pun.</p>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      <div className="payment-actions">
        <button className="button button-dark payment-pay" type="button" onClick={confirmPayment} disabled={secondsLeft === 0}>Saya sudah bayar — verifikasi sekarang <span>→</span></button>
        {confirmCancel
          ? <div className="payment-cancel-confirm"><span>Yakin batalkan pesanan? Stok akan dikembalikan.</span><div><button type="button" className="payment-cancel-yes" onClick={cancelOrder} disabled={cancelling}>{cancelling ? 'Membatalkan…' : 'Ya, batalkan'}</button><button type="button" className="payment-cancel-no" onClick={() => setConfirmCancel(false)}>Lanjut bayar</button></div></div>
          : <button className="payment-cancel" type="button" onClick={() => setConfirmCancel(true)}>Batalkan pesanan</button>}
      </div>
    </>}

    {phase === 'processing' && <div className="payment-status is-processing">
      <span className="payment-spinner" aria-hidden />
      <p className="eyebrow">Menghubungkan ke simulator {method.name}</p>
      <h3>{PROCESSING_STEPS[stepIndex]}</h3>
      <ul className="payment-progress"><li className={stepIndex >= 0 ? 'is-done' : ''}><span>Transaksi dibuat</span></li><li className={stepIndex >= 1 ? 'is-done' : ''}><span>Menunggu konfirmasi</span></li><li className={stepIndex >= 2 ? 'is-done' : ''}><span>Verifikasi pembayaran</span></li></ul>
      <small className="payment-muted">Jangan tutup halaman ini…</small>
    </div>}

    {phase === 'success' && <div className="payment-status is-success">
      <span className="payment-check" aria-hidden>✓</span>
      <p className="eyebrow">Pembayaran berhasil</p>
      <h3>{method.name} terkonfirmasi — pesananmu aman 🎉</h3>
      <ul className="payment-receipt">
        <li><span>Nomor pesanan</span><strong>{order.orderNumber}</strong></li>
        <li><span>Metode</span><strong>{method.icon} {method.name}</strong></li>
        <li><span>Referensi bayar</span><strong>{paymentRef}</strong></li>
        <li><span>Waktu</span><strong>{paidAt}</strong></li>
        <li><span>Total dibayar</span><strong>{formatIDR(order.total)}</strong></li>
      </ul>
      <div className="payment-actions">
        <Link href="/products" className="button button-dark payment-pay">Belanja lagi <span>→</span></Link>
        <p className="payment-muted">Pesanan sedang kami proses dan dikirim sesuai pilihan ongkir Anda.</p>
      </div>
    </div>}

    {phase === 'expired' && <div className="payment-status is-expired">
      <span className="payment-expired-icon" aria-hidden>⏰</span>
      <p className="eyebrow">Waktu pembayaran habis</p>
      <h3>Batas 15 menit terlewati</h3>
      <p className="payment-muted">Pesanan <strong>{order.orderNumber}</strong> kedaluwarsa di simulator. Kamu bisa memesannya lagi dari keranjang — stok belum berubah.</p>
      <div className="payment-actions">
        <button type="button" className="button button-dark payment-pay" onClick={() => { setSecondsLeft(EXPIRY_SECONDS); setPhase('instruction') }}>Perpanjang & coba lagi <span>↻</span></button>
        <button className="payment-cancel" type="button" onClick={cancelOrder} disabled={cancelling}>{cancelling ? 'Membatalkan…' : 'Batalkan pesanan'}</button>
      </div>
    </div>}
  </section>
}

export { PAYMENT_STORAGE_KEY }

'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import PaymentSimulator, { PAYMENT_STORAGE_KEY } from '@/components/PaymentSimulator'
import { paymentMethods, formatIDR, type PaymentCategory } from '@/lib/payment-methods'

type CartItem = { id: string; name: string; category: string; price: number; quantity: number }
type ShippingMethod = 'regular' | 'express'
type PlacedOrder = { orderNumber: string; total: number; paymentMethodCode: string; payToken?: string }
type CheckoutUser = { name: string; email: string; phone: string | null }

const CART_STORAGE_KEY = 'gila-komputer-cart'
const shippingOptions: Record<ShippingMethod, { label: string; description: string; fee: number }> = {
  regular: { label: 'Regular', description: '2-4 hari kerja', fee: 25000 },
  express: { label: 'Express', description: '1-2 hari kerja', fee: 50000 },
}

const categoryLabels: Record<PaymentCategory, string> = {
  ewallet: 'E-Wallet',
  bank: 'Transfer Bank',
  'virtual-account': 'Virtual Account',
}

const stepTitles = ['Data & Alamat', 'Kirim & Bayar', 'Konfirmasi']

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export default function CheckoutForm({ user = null }: { user?: CheckoutUser | null }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [step, setStep] = useState(0)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('regular')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [payTab, setPayTab] = useState<PaymentCategory>('ewallet')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [order, setOrder] = useState<PlacedOrder | null>(null)
  const [form, setForm] = useState({ customerName: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', address: '', city: '', postalCode: '' })
  const fieldsRef = useRef<HTMLDivElement>(null)
  const payRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Pulihkan sesi pembayaran yang belum tuntas setelah refresh halaman.
    try {
      const storedOrder = window.localStorage.getItem(PAYMENT_STORAGE_KEY)
      if (storedOrder) {
        const parsed = JSON.parse(storedOrder) as PlacedOrder
        if (parsed?.orderNumber && parsed?.paymentMethodCode) setOrder(parsed)
      }
    } catch { /* abaikan */ }

    const storedItems = window.localStorage.getItem(CART_STORAGE_KEY)
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems) as CartItem[]
        if (Array.isArray(parsedItems)) window.setTimeout(() => setItems(parsedItems), 0)
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY)
      }
    }
  }, [])

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const shippingFee = shippingOptions[shippingMethod].fee
  const total = subtotal + shippingFee
  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => { if (!current[field]) return current; const next = { ...current }; delete next[field]; return next })
  }

  const groupedMethods = useMemo(() => {
    const groups: Record<PaymentCategory, typeof paymentMethods> = { ewallet: [], bank: [], 'virtual-account': [] }
    for (const method of paymentMethods) groups[method.category].push(method)
    return groups
  }, [])

  const selectedMethodName = paymentMethods.find((method) => method.code === paymentMethod)?.name ?? ''

  const clearStoredOrder = () => {
    window.localStorage.removeItem(PAYMENT_STORAGE_KEY)
    setOrder(null)
  }

  const validateStepOne = () => {
    const errors: Record<string, string> = {}
    if (!form.customerName.trim()) errors.customerName = 'Nama lengkap wajib diisi.'
    if (!form.email.trim()) errors.email = 'Email wajib diisi.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Format email belum benar.'
    if (!form.phone.trim()) errors.phone = 'Nomor telepon wajib diisi.'
    else if (!/^(\+?62|0)8[1-9][0-9\s-]{7,14}$/.test(form.phone.trim())) errors.phone = 'Gunakan format 08xx atau +628xx.'
    if (!form.address.trim()) errors.address = 'Alamat lengkap wajib diisi.'
    if (!form.city.trim()) errors.city = 'Kota wajib diisi.'
    if (!/^[1-9][0-9]{4}$/.test(form.postalCode.trim())) errors.postalCode = 'Kode pos 5 angka.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const goToPaymentStep = () => {
    if (!validateStepOne()) return
    setError('')
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPayTab = (category: PaymentCategory) => {
    setPayTab(category)
    if (!paymentMethod) {
      const firstAvailable = paymentMethods.find((method) => method.category === category)
      if (firstAvailable) setPaymentMethod(firstAvailable.code)
    }
  }

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!paymentMethod) { setError('Pilih metode pembayaran terlebih dahulu.'); payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, shippingMethod, paymentMethod, items: items.map((item) => ({ productId: Number(item.id), quantity: item.quantity })) }) })
      const result = await response.json() as { order?: { orderNumber: string; total: number; paymentMethod: string; payToken?: string }; error?: string }
      if (!response.ok || !result.order) throw new Error(result.error ?? 'Order tidak dapat dibuat.')
      window.localStorage.removeItem(CART_STORAGE_KEY)
      window.dispatchEvent(new CustomEvent('gila:cart-updated', { detail: { items: [] } }))
      setItems([])
      const placed: PlacedOrder = { orderNumber: result.order.orderNumber, total: result.order.total, paymentMethodCode: result.order.paymentMethod ?? paymentMethod, payToken: result.order.payToken }
      window.localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(placed))
      setOrder(placed)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (order) {
    return <div className="checkout-payment-stage">
      <PaymentSimulator key={order.orderNumber} order={order} onDone={clearStoredOrder} />
      <p className="checkout-payment-back"><Link href="/products" className="text-link">← Kembali ke katalog</Link></p>
    </div>
  }

  if (!items.length) return <section className="checkout-empty"><p className="eyebrow">Keranjang kosong</p><h2>Belum ada<br /><em>yang berangkat.</em></h2><p>Tambahkan komponen ke keranjang sebelum melanjutkan ke checkout.</p><Link href="/products" className="button button-dark">Pilih komponen <span>↗</span></Link></section>

  const summaryPanel = <aside className="checkout-summary" aria-label="Ringkasan order">
    <p className="eyebrow">Ringkasan · {items.reduce((sum, item) => sum + item.quantity, 0)} barang</p>
    <div className="checkout-summary-items">{items.map((item) => <div key={item.id}><span>{item.name}<small>{item.quantity} × {formatPrice(item.price)}</small></span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div>
    <div className="checkout-summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
    <div className="checkout-summary-line"><span>Ongkir ({shippingOptions[shippingMethod].label})</span><strong>{formatPrice(shippingFee)}</strong></div>
    {paymentMethod && <div className="checkout-summary-line"><span>Metode bayar</span><strong>{selectedMethodName}</strong></div>}
    <div className="checkout-total"><span>Total</span><strong>{formatIDR(total)}</strong></div>
    {error && <p className="checkout-error" role="alert">{error}</p>}
    {step === 0
      ? <button className="button button-dark" type="button" onClick={goToPaymentStep}>Lanjut ke pengiriman &amp; bayar <span>→</span></button>
      : <>
        <button className="button button-dark" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Membuat pesanan…' : `Buat pesanan & bayar ${formatIDR(total)}`} <span>→</span></button>
        <button className="checkout-back" type="button" onClick={() => { setError(''); setStep(0); fieldsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>← Edit data pemesan</button>
      </>}
    <p className="checkout-safe">🔒 Data hanya dipakai untuk pengiriman. Pembayaran berjalan dalam mode simulasi.</p>
  </aside>

  return <form className="checkout-layout" onSubmit={submitOrder}>
    <div className="checkout-fields" ref={fieldsRef}>
      <nav className="checkout-stepper" aria-label="Progres pemesanan">
        {stepTitles.map((title, index) => <div key={title} className={`stepper-item${index === step ? ' is-current' : ''}${index < step ? ' is-done' : ''}`}>
          <button type="button" onClick={() => { if (index < step) { setError(''); setStep(index) } }} disabled={index > step} aria-current={index === step ? 'step' : undefined}>
            <span>{index < step ? '✓' : index + 1}</span>{title}
          </button>
        </div>)}
      </nav>

      {step === 0 && <>
        <section className="checkout-section"><div className="checkout-section-heading"><span>01</span><div><p className="eyebrow">Data customer</p><h2>Siapa yang<br /><em>memesan?</em></h2></div></div>
          <div className="checkout-field-grid">
            <label>Nama lengkap<input required value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} placeholder="cth. Budi Santoso" autoComplete="name" />{fieldErrors.customerName && <em className="field-error">{fieldErrors.customerName}</em>}</label>
            <label>Email<input required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="nama@email.com" autoComplete="email" inputMode="email" />{fieldErrors.email && <em className="field-error">{fieldErrors.email}</em>}</label>
            <label>Nomor telepon<input required type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" inputMode="tel" />{fieldErrors.phone && <em className="field-error">{fieldErrors.phone}</em>}</label>
          </div>
        </section>
        <section className="checkout-section"><div className="checkout-section-heading"><span>02</span><div><p className="eyebrow">Alamat pengiriman</p><h2>Ke mana<br /><em>kami antar?</em></h2></div></div>
          <div className="checkout-field-grid">
            <label className="field-wide">Alamat lengkap<textarea required rows={3} value={form.address} onChange={(event) => updateField('address', event.target.value)} placeholder="Jalan, nomor rumah, RT/RW, kecamatan" autoComplete="street-address" />{fieldErrors.address && <em className="field-error">{fieldErrors.address}</em>}</label>
            <label>Kota<input required value={form.city} onChange={(event) => updateField('city', event.target.value)} placeholder="cth. Bandung" autoComplete="address-level2" />{fieldErrors.city && <em className="field-error">{fieldErrors.city}</em>}</label>
            <label>Kode pos<input required inputMode="numeric" maxLength={5} value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value.replace(/\D/g, ''))} placeholder="40xxx" autoComplete="postal-code" />{fieldErrors.postalCode && <em className="field-error">{fieldErrors.postalCode}</em>}</label>
          </div>
        </section>
      </>}

      {step === 1 && <>
        <section className="checkout-section"><div className="checkout-section-heading"><span>03</span><div><p className="eyebrow">Metode pengiriman</p><h2>Pilih cara<br /><em>sampainya.</em></h2></div></div>
          <div className="shipping-options">{Object.entries(shippingOptions).map(([value, option]) => <label className={shippingMethod === value ? 'shipping-option is-active' : 'shipping-option'} key={value}><input type="radio" name="shipping" value={value} checked={shippingMethod === value} onChange={() => setShippingMethod(value as ShippingMethod)} /><span><strong>{option.label}</strong><small>{option.description}</small></span><b>{formatPrice(option.fee)}</b></label>)}</div>
        </section>
        <section className="checkout-section checkout-payment-section" ref={payRef}><div className="checkout-section-heading"><span>04</span><div><p className="eyebrow">Metode pembayaran · simulasi</p><h2>Bayar lewat<br /><em>mana?</em></h2></div></div>
          <div className="payment-tabs" role="tablist" aria-label="Kategori metode pembayaran">
            {(Object.keys(groupedMethods) as PaymentCategory[]).map((category) => <button key={category} type="button" role="tab" aria-selected={payTab === category} className={payTab === category ? 'payment-tab is-active' : 'payment-tab'} onClick={() => goToPayTab(category)}>{categoryLabels[category]}</button>)}
          </div>
          <div className="payment-options" role="radiogroup" aria-label="Metode pembayaran">{groupedMethods[payTab].map((method) => <label key={method.code} className={paymentMethod === method.code ? 'payment-option is-active' : 'payment-option'} style={{ ['--pay-accent' as string]: method.color }}>
            <input type="radio" name="payment" value={method.code} checked={paymentMethod === method.code} onChange={() => setPaymentMethod(method.code)} />
            <span className="payment-option-icon" style={{ background: `${method.color}22` }} aria-hidden>{method.icon}</span>
            <span className="payment-option-text"><strong>{method.name}</strong><small>{method.description}</small></span>
            <span className="payment-option-check" aria-hidden>{paymentMethod === method.code ? '✓' : ''}</span>
          </label>)}</div>
          <p className="payment-sim-badge">🧪 Mode simulasi — tidak ada transaksi uang sungguhan.</p>
        </section>
      </>}
    </div>
    {summaryPanel}
    <div className="checkout-mobile-bar"><span>{formatIDR(total)}</span><button className="button button-dark" type={step === 0 ? 'button' : 'submit'} onClick={step === 0 ? goToPaymentStep : undefined} disabled={step === 1 && isSubmitting}>{step === 0 ? 'Lanjut' : isSubmitting ? 'Menyimpan…' : 'Bayar'} <span>→</span></button></div>
  </form>
}

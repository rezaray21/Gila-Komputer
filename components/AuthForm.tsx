'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Mode = 'login' | 'register'
type FormState = { name: string; email: string; phone: string; password: string; confirm: string }

export default function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter()
  const isRegister = mode === 'register'
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => { if (!current[field]) return current; const rest = { ...current }; delete rest[field]; return rest })
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (isRegister && form.password !== form.confirm) { setFieldErrors({ confirm: 'Konfirmasi password belum sama.' }); return }
    setBusy(true)
    try {
      const payload = isRegister ? { name: form.name, email: form.email, phone: form.phone, password: form.password } : { email: form.email, password: form.password, next }
      const response = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json() as { error?: string; fieldErrors?: Record<string, string>; redirectTo?: string }
      if (!response.ok) { setError(result.error ?? 'Terjadi kesalahan. Coba lagi.'); setFieldErrors(result.fieldErrors ?? {}); return }
      router.replace(isRegister ? next : result.redirectTo ?? next)
      router.refresh()
    } catch {
      setError('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  const query = next === '/akun' ? '' : `?next=${encodeURIComponent(next)}`
  const field = (name: keyof FormState) => fieldErrors[name] ? <em className="field-error">{fieldErrors[name]}</em> : null
  const invalid = (name: keyof FormState) => fieldErrors[name] ? 'is-invalid' : undefined

  return <form className="auth-card" onSubmit={submit} noValidate>
    <div className="checkout-field-grid auth-fields">
      {isRegister && <label>Nama lengkap<input className={invalid('name')} value={form.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" placeholder="cth. Budi Santoso" required />{field('name')}</label>}
      <label>Email<input className={invalid('email')} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" inputMode="email" placeholder="nama@email.com" required />{field('email')}</label>
      {isRegister && <label>Nomor telepon (opsional)<input className={invalid('phone')} type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" inputMode="tel" placeholder="08xxxxxxxxxx" />{field('phone')}</label>}
      <label>Password<input className={invalid('password')} type="password" value={form.password} onChange={(event) => update('password', event.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'Min. 8 karakter, huruf dan angka' : 'Password kamu'} required />{field('password')}</label>
      {isRegister && <label>Ulangi password<input className={invalid('confirm')} type="password" value={form.confirm} onChange={(event) => update('confirm', event.target.value)} autoComplete="new-password" required />{field('confirm')}</label>}
    </div>
    {error && <p className="checkout-error" role="alert">{error}</p>}
    <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? (isRegister ? 'Membuat akun…' : 'Memeriksa…') : (isRegister ? 'Buat akun' : 'Masuk')} <span>→</span></button>
    <p className="auth-alt">{isRegister ? <>Sudah punya akun? <Link href={`/masuk${query}`}>Masuk</Link></> : <>Belum punya akun? <Link href={`/daftar${query}`}>Daftar</Link></>}</p>
    <p className="auth-note">Belanja tanpa akun juga bisa — kamu tetap dapat checkout sebagai tamu.</p>
  </form>
}

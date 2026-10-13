export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Sama dengan aturan di form checkout: 08xx atau +628xx.
export const PHONE_PATTERN = /^(\+?62|0)8[1-9][0-9\s-]{7,14}$/

export const normalizeEmail = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '')
export const normalizeName = (value: unknown) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '')

export function validateName(name: string): string | null {
  if (name.length < 2) return 'Nama minimal 2 karakter.'
  if (name.length > 80) return 'Nama maksimal 80 karakter.'
  return null
}

export function validateEmail(email: string): string | null {
  if (!email) return 'Email wajib diisi.'
  if (email.length > 190 || !EMAIL_PATTERN.test(email)) return 'Format email belum benar.'
  return null
}

// Telepon opsional; string kosong dianggap tidak diisi.
export function validateOptionalPhone(phone: string): string | null {
  if (!phone) return null
  return PHONE_PATTERN.test(phone) ? null : 'Gunakan format 08xx atau +628xx.'
}

// bcrypt hanya membaca 72 byte pertama, jadi batasnya dihitung dalam byte.
export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password minimal 8 karakter.'
  if (new TextEncoder().encode(password).length > 72) return 'Password maksimal 72 karakter.'
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Password harus berisi huruf dan angka.'
  return null
}

// Hanya menerima path internal ("/akun"), menolak URL penuh atau "//host" (open redirect).
export function safeNextPath(next: unknown, fallback = '/akun'): string {
  if (typeof next !== 'string') return fallback
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\') || /[\r\n]/.test(next)) return fallback
  return next
}

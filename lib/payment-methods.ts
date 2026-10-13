// Katalog metode pembayaran untuk SIMULASI (tidak terhubung ke gateway sungguhan).
export type PaymentCategory = 'ewallet' | 'bank' | 'virtual-account'

export type PaymentMethod = {
  code: string
  name: string
  category: PaymentCategory
  description: string
  color: string // warna aksen kartu di UI
  icon: string // emoji sederhana sebagai ikon
}

export const paymentMethods: PaymentMethod[] = [
  // ---- E-Wallet ----
  { code: 'gopay', name: 'GoPay', category: 'ewallet', description: 'Bayar via saldo GoPay', color: '#00aed6', icon: '📲' },
  { code: 'ovo', name: 'OVO', category: 'ewallet', description: 'Bayar via saldo OVO', color: '#4c3494', icon: '💜' },
  { code: 'dana', name: 'DANA', category: 'ewallet', description: 'Bayar via saldo DANA', color: '#1189d6', icon: '💙' },
  { code: 'shopeepay', name: 'ShopeePay', category: 'ewallet', description: 'Bayar via saldo ShopeePay', color: '#ee4d2d', icon: '🧡' },
  { code: 'linkaja', name: 'LinkAja', category: 'ewallet', description: 'Bayar via saldo LinkAja', color: '#e4002b', icon: '❤️' },
  // ---- Transfer Bank ----
  { code: 'bca', name: 'BCA', category: 'bank', description: 'Transfer manual ke rekening BCA', color: '#0060af', icon: '🏦' },
  { code: 'bni', name: 'BNI', category: 'bank', description: 'Transfer manual ke rekening BNI', color: '#f26722', icon: '🏦' },
  { code: 'mandiri', name: 'Mandiri', category: 'bank', description: 'Transfer manual ke rekening Mandiri', color: '#003a70', icon: '🏦' },
  // ---- Virtual Account ----
  { code: 'bca-va', name: 'BCA Virtual Account', category: 'virtual-account', description: 'VA otomatis terverifikasi', color: '#0060af', icon: '🔢' },
  { code: 'mandiri-va', name: 'Mandiri Virtual Account', category: 'virtual-account', description: 'VA otomatis terverifikasi', color: '#003a70', icon: '🔢' },
]

export const findPaymentMethod = (code: string) => paymentMethods.find((method) => method.code === code)

export const formatIDR = (value: number) => `Rp${value.toLocaleString('id-ID')}`

// Nomor rekening/merchant "dummy" — murni untuk tampilan simulasi.
const dummyAccount = (prefix: string, seed: string) => {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const digits = Array.from({ length: 10 }, (_, index) => String((hash >> (index * 2)) % 10)).join('')
  return `${prefix}-${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`
}

export type PaymentInstruction = { label: string; value: string }

export function getPaymentInstructions(method: PaymentMethod, orderNumber: string): PaymentInstruction[] {
  switch (method.category) {
    case 'ewallet':
      return [
        { label: 'Nomor tujuan', value: dummyAccount('08xx', method.code + orderNumber) },
        { label: 'Atas nama', value: 'GILA KOMPUTER PC' },
        { label: 'Jumlah', value: '' }, // diisi total oleh pemanggil
      ]
    case 'bank':
      return [
        { label: 'Nomor rekening', value: dummyAccount(method.code.toUpperCase(), method.code + orderNumber) },
        { label: 'Atas nama', value: 'PT GILA KOMPUTER INDONESIA' },
        { label: 'Jumlah', value: '' },
      ]
    case 'virtual-account':
      return [
        { label: 'Virtual Account', value: `${method.code === 'bca-va' ? '3901' : '8950'}${orderNumber.replace(/\D/g, '').slice(-10)}` },
        { label: 'Jumlah', value: '' },
      ]
  }
}

export const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Menunggu pembayaran',
  PAID: 'Dibayar',
  SHIPPED: 'Dikirim',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
}

// Alur status yang boleh dilakukan admin. Pembatalan mengembalikan stok.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}

export const isOrderStatus = (value: unknown): value is OrderStatus => typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value)

export const statusLabel = (status: string) => (isOrderStatus(status) ? STATUS_LABELS[status] : status)

export const allowedTransitions = (from: string): OrderStatus[] => (isOrderStatus(from) ? TRANSITIONS[from] : [])

export const canTransition = (from: string, to: string) => isOrderStatus(to) && allowedTransitions(from).includes(to)

// Teks tombol untuk tiap status tujuan di panel admin.
export const ACTION_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Kembalikan ke menunggu',
  PAID: 'Tandai sudah dibayar',
  SHIPPED: 'Tandai dikirim',
  COMPLETED: 'Tandai selesai',
  CANCELLED: 'Batalkan pesanan',
}

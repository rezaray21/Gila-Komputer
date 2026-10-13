// Pembatas percobaan sederhana di memori proses. Cukup untuk satu server;
// bila nanti dipasang di banyak instance, pindahkan ke Redis atau tabel database.
type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

function current(key: string): Entry | null {
  const entry = store.get(key)
  if (!entry) return null
  if (entry.resetAt <= Date.now()) {
    store.delete(key)
    return null
  }
  return entry
}

export function isLimited(key: string, limit: number) {
  return (current(key)?.count ?? 0) >= limit
}

// Mencatat satu kejadian dan mengembalikan total dalam jendela waktu saat ini.
export function hit(key: string, windowMs: number) {
  const entry = current(key)
  if (entry) {
    entry.count += 1
    return entry.count
  }
  if (store.size > 5000) for (const [storedKey, value] of store) if (value.resetAt <= Date.now()) store.delete(storedKey)
  store.set(key, { count: 1, resetAt: Date.now() + windowMs })
  return 1
}

export function reset(key: string) {
  store.delete(key)
}

export function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
}

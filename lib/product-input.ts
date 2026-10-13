export const PRODUCT_STATUSES = ['ACTIVE', 'INACTIVE'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)

export type ParsedProduct = {
  name: string
  slug: string
  description: string
  price: number
  stock: number
  status: ProductStatus
  imageUrl: string
  specs: Record<string, string>
  category: { id: number } | { name: string }
  brand: { id: number } | { name: string } | null
}

const MAX_INT = 2_000_000_000 // batas aman kolom INT MySQL (signed 32-bit)

// Domain gambar eksternal yang diizinkan (harus sinkron dengan images.remotePatterns di next.config.ts).
export const ALLOWED_IMAGE_HOSTS: readonly string[] = ['picsum.photos']

function toInteger(value: unknown): number | null {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  return typeof number === 'number' && Number.isInteger(number) ? number : null
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

// Memvalidasi payload form produk dari admin. Mengembalikan data bersih atau pesan error yang ramah.
export function parseProductInput(body: unknown): { data: ParsedProduct } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Data produk tidak valid.' }
  const input = body as Record<string, unknown>

  const name = text(input.name).replace(/\s+/g, ' ')
  if (name.length < 2 || name.length > 120) return { error: 'Nama produk 2–120 karakter.' }

  const slug = slugify(text(input.slug) || name)
  if (slug.length < 2) return { error: 'Slug tidak valid. Gunakan huruf, angka, dan tanda hubung.' }

  const description = text(input.description)
  if (!description || description.length > 2000) return { error: 'Deskripsi wajib diisi (maksimal 2000 karakter).' }

  const price = toInteger(input.price)
  if (price === null || price < 0 || price > MAX_INT) return { error: 'Harga harus berupa angka bulat (Rupiah) tanpa titik.' }

  const stock = toInteger(input.stock)
  if (stock === null || stock < 0 || stock > 1_000_000) return { error: 'Stok harus berupa angka bulat 0 atau lebih.' }

  const status = text(input.status)
  if (!(PRODUCT_STATUSES as readonly string[]).includes(status)) return { error: 'Status produk tidak valid.' }

  // Gambar boleh: (a) path lokal di folder public, atau (b) URL https dari domain yang diizinkan.
  const imageUrl = text(input.imageUrl)
  if (imageUrl && imageUrl.length > 191) {
    return { error: 'Alamat gambar terlalu panjang (maks. 191 karakter).' }
  }
  if (imageUrl && imageUrl.startsWith('https://')) {
    let host = ''
    try {
      host = new URL(imageUrl).hostname
    } catch {
      return { error: 'Alamat gambar tidak valid.' }
    }
    if (!ALLOWED_IMAGE_HOSTS.includes(host)) {
      return { error: `Host gambar harus salah satu dari: ${ALLOWED_IMAGE_HOSTS.join(', ')}.` }
    }
  } else if (imageUrl && (imageUrl.includes('..') || imageUrl.startsWith('//') || !/^\/[A-Za-z0-9/_.-]+$/.test(imageUrl))) {
    // Path lokal: diawali "/" tunggal, tanpa "..", tanpa "//" (protocol-relative).
    return { error: 'Gambar harus path lokal (contoh /products/vga.svg) atau URL https dari domain yang diizinkan.' }
  }

  const specs: Record<string, string> = {}
  if (input.specs !== undefined && (typeof input.specs !== 'object' || input.specs === null || Array.isArray(input.specs))) return { error: 'Format spesifikasi tidak valid.' }
  for (const [rawKey, rawValue] of Object.entries((input.specs ?? {}) as Record<string, unknown>)) {
    const key = rawKey.trim()
    const value = typeof rawValue === 'string' ? rawValue.trim() : ''
    if (!key && !value) continue
    if (!key || !value) return { error: 'Setiap spesifikasi harus punya nama dan nilai.' }
    if (key.length > 40 || value.length > 120) return { error: 'Nama spesifikasi maks. 40 karakter dan nilainya maks. 120 karakter.' }
    specs[key] = value
  }
  if (Object.keys(specs).length > 20) return { error: 'Spesifikasi maksimal 20 baris.' }

  const newCategory = text(input.newCategory)
  const categoryId = toInteger(input.categoryId)
  let category: ParsedProduct['category']
  if (newCategory) {
    if (newCategory.length < 2 || newCategory.length > 40) return { error: 'Nama kategori baru 2–40 karakter.' }
    category = { name: newCategory }
  } else if (categoryId !== null && categoryId > 0) category = { id: categoryId }
  else return { error: 'Pilih kategori produk.' }

  const newBrand = text(input.newBrand)
  const brandId = toInteger(input.brandId)
  let brand: ParsedProduct['brand'] = null
  if (newBrand) {
    if (newBrand.length < 2 || newBrand.length > 40) return { error: 'Nama merek baru 2–40 karakter.' }
    brand = { name: newBrand }
  } else if (brandId !== null && brandId > 0) brand = { id: brandId }

  return { data: { name, slug, description, price, stock, status: status as ProductStatus, imageUrl, specs, category, brand } }
}

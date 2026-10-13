'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { slugify } from '@/lib/product-input'

type Option = { id: number; name: string }
export type ProductFormValues = {
  id: number
  name: string
  slug: string
  description: string
  price: number
  stock: number
  status: string
  imageUrl: string
  specs: Record<string, string>
  categoryId: number
  brandId: number | null
}
type SpecRow = { id: number; key: string; value: string }

const NEW = '__new__'
// Id baris spesifikasi hanya dipakai sebagai key React (tidak dirender ke DOM), jadi aman memakai pencacah modul.
let rowSequence = 0
const makeRow = (key = '', value = ''): SpecRow => ({ id: rowSequence++, key, value })
const IMAGE_PRESETS = ['processor', 'motherboard', 'ram', 'vga', 'storage', 'power', 'case', 'cpu-cooler', 'fan', 'monitor', 'keyboard', 'mouse'].map((name) => `/products/${name}.svg`)
// Contoh URL gambar eksternal gratis (picsum.photos): seed yang sama selalu menghasilkan gambar yang sama.
const IMAGE_URL_EXAMPLES = Array.from({ length: 12 }, (_, i) => `https://picsum.photos/seed/gk-${i + 1}/640/480`)

export default function AdminProductForm({ categories, brands, product }: { categories: Option[]; brands: Option[]; product?: ProductFormValues }) {
  const router = useRouter()
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(product))
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [stock, setStock] = useState(product ? String(product.stock) : '0')
  const [status, setStatus] = useState(product?.status ?? 'ACTIVE')
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [categoryChoice, setCategoryChoice] = useState(product ? String(product.categoryId) : categories[0] ? String(categories[0].id) : NEW)
  const [newCategory, setNewCategory] = useState('')
  const [brandChoice, setBrandChoice] = useState(product?.brandId ? String(product.brandId) : '')
  const [newBrand, setNewBrand] = useState('')
  const [specRows, setSpecRows] = useState<SpecRow[]>(() => {
    const entries = Object.entries(product?.specs ?? {})
    return entries.length ? entries.map(([key, value]) => makeRow(key, value)) : [makeRow()]
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const changeName = (value: string) => {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }
  const updateRow = (id: number, field: 'key' | 'value', value: string) => setSpecRows((rows) => rows.map((row) => row.id === id ? { ...row, [field]: value } : row))
  const pricePreview = /^\d+$/.test(price) ? `Rp ${Number(price).toLocaleString('id-ID')}` : ''

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const specs = Object.fromEntries(specRows.filter((row) => row.key.trim() || row.value.trim()).map((row) => [row.key, row.value]))
      const payload = {
        name, slug, description, price, stock, status, imageUrl, specs,
        categoryId: categoryChoice === NEW ? null : Number(categoryChoice),
        newCategory: categoryChoice === NEW ? newCategory : '',
        brandId: brandChoice && brandChoice !== NEW ? Number(brandChoice) : null,
        newBrand: brandChoice === NEW ? newBrand : '',
      }
      const response = await fetch(product ? `/api/admin/products/${product.id}` : '/api/admin/products', { method: product ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Produk tidak dapat disimpan.')
      router.push('/admin/products')
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Produk tidak dapat disimpan.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!product) return
    setDeleting(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Produk tidak dapat dihapus.')
      router.push('/admin/products')
      router.refresh()
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Produk tidak dapat dihapus.')
      setConfirmDelete(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setDeleting(false)
    }
  }

  return <form className="admin-form" onSubmit={submit}>
    {error && <p className="checkout-error" role="alert">{error}</p>}

    <fieldset className="admin-fieldset">
      <legend>Informasi dasar</legend>
      <label className="admin-field">Nama produk<input value={name} onChange={(event) => changeName(event.target.value)} required maxLength={120} placeholder="cth. RTX 4070 Super 12GB" /></label>
      <label className="admin-field">Slug (alamat halaman)<input value={slug} onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)) }} required maxLength={120} placeholder="rtx-4070-super-12gb" /><small>/products/{slug || '…'}</small></label>
      <label className="admin-field">Deskripsi<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} required maxLength={2000} /></label>
    </fieldset>

    <fieldset className="admin-fieldset">
      <legend>Harga, stok, dan tampil</legend>
      <div className="admin-field-row">
        <label className="admin-field">Harga (Rupiah)<input value={price} onChange={(event) => setPrice(event.target.value.replace(/\D/g, ''))} inputMode="numeric" required placeholder="10500000" /><small>{pricePreview || 'Angka saja, tanpa titik'}</small></label>
        <label className="admin-field">Stok<input value={stock} onChange={(event) => setStock(event.target.value.replace(/\D/g, ''))} inputMode="numeric" required /></label>
        <label className="admin-field">Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ACTIVE">Aktif (tampil di toko)</option><option value="INACTIVE">Nonaktif (disembunyikan)</option></select></label>
      </div>
      <label className="admin-field">Gambar<input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} list="image-presets" placeholder="/products/vga.svg" /><small>Path file di folder public (contoh /products/vga.svg) atau URL https dari domain yang diizinkan (picsum.photos). Kosongkan untuk memakai inisial kategori.</small></label>
      <datalist id="image-presets">{[...IMAGE_PRESETS, ...IMAGE_URL_EXAMPLES].map((path) => <option key={path} value={path} />)}</datalist>
      {imageUrl && <div className="admin-image-preview"><Image src={imageUrl} alt="Pratinjau gambar produk" width={240} height={160} unoptimized /></div>}
    </fieldset>

    <fieldset className="admin-fieldset">
      <legend>Kategori dan merek</legend>
      <div className="admin-field-row">
        <label className="admin-field">Kategori<select value={categoryChoice} onChange={(event) => setCategoryChoice(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}<option value={NEW}>+ Kategori baru…</option></select>{categoryChoice === NEW && <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nama kategori baru" required maxLength={40} />}</label>
        <label className="admin-field">Merek (opsional)<select value={brandChoice} onChange={(event) => setBrandChoice(event.target.value)}><option value="">Tanpa merek</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}<option value={NEW}>+ Merek baru…</option></select>{brandChoice === NEW && <input value={newBrand} onChange={(event) => setNewBrand(event.target.value)} placeholder="Nama merek baru" required maxLength={40} />}</label>
      </div>
    </fieldset>

    <fieldset className="admin-fieldset">
      <legend>Spesifikasi</legend>
      <p className="admin-muted">Tampil di halaman detail dan dipakai PC Builder untuk cek kecocokan: Socket (CPU/motherboard), Memory (motherboard), Type (RAM), TDP (VGA), Cores (CPU), Wattage (PSU). Builder juga mencocokkan nama kategori Motherboard, RAM, Power, dan VGA, jadi jangan ubah ejaannya.</p>
      {specRows.map((row) => <div className="admin-spec-row" key={row.id}>
        <input value={row.key} onChange={(event) => updateRow(row.id, 'key', event.target.value)} placeholder="Nama (cth. Socket)" maxLength={40} aria-label="Nama spesifikasi" />
        <input value={row.value} onChange={(event) => updateRow(row.id, 'value', event.target.value)} placeholder="Nilai (cth. AM5)" maxLength={120} aria-label="Nilai spesifikasi" />
        <button type="button" className="button-quiet" onClick={() => setSpecRows((rows) => rows.length > 1 ? rows.filter((item) => item.id !== row.id) : [makeRow()])} aria-label="Hapus baris">×</button>
      </div>)}
      {specRows.length < 20 && <button type="button" className="button-quiet" onClick={() => setSpecRows((rows) => [...rows, makeRow()])}>+ Tambah baris</button>}
    </fieldset>

    <div className="admin-form-footer">
      <button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : product ? 'Simpan perubahan' : 'Tambah produk'} <span>→</span></button>
      <Link href="/admin/products" className="text-link">Batal</Link>
      {product && (confirmDelete
        ? <span className="admin-confirm">Hapus permanen?<button type="button" className="button-danger" onClick={remove} disabled={deleting}>{deleting ? 'Menghapus…' : 'Ya, hapus'}</button><button type="button" className="button-quiet" onClick={() => setConfirmDelete(false)}>Tidak jadi</button></span>
        : <button type="button" className="button-quiet is-destructive admin-delete" onClick={() => setConfirmDelete(true)}>Hapus produk</button>)}
    </div>
  </form>
}

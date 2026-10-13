import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseProductInput, slugify } from './product-input'

const valid = { name: 'RTX 4070 Super 12GB', slug: '', description: 'GPU 1440p', price: '10500000', stock: 8, status: 'ACTIVE', imageUrl: '/products/vga.svg', specs: { GPU: 'RTX 4070 Super', '': '' }, categoryId: 1, brandId: null }

test('slugify', () => {
  assert.equal(slugify('RTX 4070 Super 12GB'), 'rtx-4070-super-12gb')
  assert.equal(slugify('  Ünïcode & Simbol!! '), 'unicode-simbol')
})

test('payload valid: slug otomatis, angka dari string, baris spesifikasi kosong dibuang', () => {
  const result = parseProductInput(valid)
  assert.ok('data' in result)
  if ('data' in result) {
    assert.equal(result.data.slug, 'rtx-4070-super-12gb')
    assert.equal(result.data.price, 10500000)
    assert.deepEqual(result.data.specs, { GPU: 'RTX 4070 Super' })
    assert.deepEqual(result.data.category, { id: 1 })
    assert.equal(result.data.brand, null)
  }
})

test('kategori/merek baru lewat nama', () => {
  const result = parseProductInput({ ...valid, categoryId: null, newCategory: 'Casing', newBrand: 'NZXT' })
  assert.ok('data' in result)
  if ('data' in result) { assert.deepEqual(result.data.category, { name: 'Casing' }); assert.deepEqual(result.data.brand, { name: 'NZXT' }) }
})

test('input buruk ditolak', () => {
  const bad = (patch: object) => assert.ok('error' in parseProductInput({ ...valid, ...patch }), JSON.stringify(patch))
  bad({ name: 'x' })
  bad({ price: '-5' })
  bad({ price: '1.5' })
  bad({ price: '3000000000' }) // melebihi INT MySQL
  bad({ stock: -1 })
  bad({ status: 'DELETED' })
  bad({ imageUrl: 'https://evil.com/x.png' })
  bad({ imageUrl: '//evil.com/x.png' })
  bad({ imageUrl: '/products/../../etc/passwd' })
  // URL https dari domain yang diizinkan harus lolos validasi.
  assert.ok('data' in parseProductInput({ ...valid, imageUrl: 'https://picsum.photos/seed/gk-1/640/480' }))
  bad({ imageUrl: 'http://picsum.photos/seed/gk-1/640/480' }) // bukan https
  bad({ specs: { Socket: '' } })
  bad({ specs: ['a'] })
  bad({ categoryId: null, newCategory: '' })
  bad({ description: '' })
  assert.ok('error' in parseProductInput(null))
})

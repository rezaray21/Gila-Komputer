import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeEmail, safeNextPath, validateEmail, validateName, validateOptionalPhone, validatePassword } from './validation'

test('normalizeEmail merapikan huruf dan spasi', () => {
  assert.equal(normalizeEmail('  Budi@Mail.COM '), 'budi@mail.com')
  assert.equal(normalizeEmail(123), '')
})

test('validateEmail', () => {
  assert.equal(validateEmail('a@b.co'), null)
  assert.ok(validateEmail('bukan-email'))
  assert.ok(validateEmail(''))
})

test('validateName', () => {
  assert.equal(validateName('Bu'), null)
  assert.ok(validateName('B'))
  assert.ok(validateName('x'.repeat(81)))
})

test('validatePassword: panjang, huruf+angka, batas 72 byte', () => {
  assert.equal(validatePassword('abcd1234'), null)
  assert.ok(validatePassword('abc123'))
  assert.ok(validatePassword('hurufsajaa'))
  assert.ok(validatePassword('12345678'))
  assert.ok(validatePassword('a1'.repeat(37))) // 74 byte
  assert.ok(validatePassword('é1'.repeat(20) + 'a1'.repeat(10))) // karakter multibyte dihitung per byte
})

test('validateOptionalPhone', () => {
  assert.equal(validateOptionalPhone(''), null)
  assert.equal(validateOptionalPhone('081234567890'), null)
  assert.equal(validateOptionalPhone('+6281234567890'), null)
  assert.ok(validateOptionalPhone('12345'))
})

test('safeNextPath menolak open redirect', () => {
  assert.equal(safeNextPath('/checkout'), '/checkout')
  assert.equal(safeNextPath('/akun/pesanan/GK-1'), '/akun/pesanan/GK-1')
  for (const bad of ['https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)', '/ok\nSet-Cookie: x=1', undefined, 42]) {
    assert.equal(safeNextPath(bad), '/akun', String(bad))
  }
  assert.equal(safeNextPath('//x', '/'), '/')
})

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hit, isLimited, reset } from './rate-limit'

test('terkunci setelah mencapai batas, bisa di-reset', () => {
  const key = 'uji|1'
  for (let i = 0; i < 4; i += 1) { hit(key, 60_000); assert.equal(isLimited(key, 5), false) }
  hit(key, 60_000)
  assert.equal(isLimited(key, 5), true)
  reset(key)
  assert.equal(isLimited(key, 5), false)
})

test('jendela waktu kedaluwarsa', async () => {
  const key = 'uji|2'
  hit(key, 20)
  assert.equal(isLimited(key, 1), true)
  await new Promise((resolve) => setTimeout(resolve, 40))
  assert.equal(isLimited(key, 1), false)
})

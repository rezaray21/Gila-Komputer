import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hashSessionToken, looksLikeSessionToken, newSessionToken } from './session-token'

test('token baru: 43 karakter, acak, dan lolos pemeriksaan bentuk', () => {
  const tokens = new Set(Array.from({ length: 200 }, newSessionToken))
  assert.equal(tokens.size, 200)
  for (const token of tokens) { assert.equal(token.length, 43); assert.equal(looksLikeSessionToken(token), true) }
})

test('hash deterministik, heksadesimal 64 karakter, dan berbeda dari token', () => {
  const token = newSessionToken()
  assert.equal(hashSessionToken(token), hashSessionToken(token))
  assert.match(hashSessionToken(token), /^[0-9a-f]{64}$/)
  assert.notEqual(hashSessionToken(token), token)
  assert.notEqual(hashSessionToken(token), hashSessionToken(newSessionToken()))
})

test('cookie sampah ditolak sebelum menyentuh database', () => {
  for (const bad of [undefined, null, '', 'abc', 'x'.repeat(42), 'x'.repeat(44), `${'a'.repeat(42)}!`, "' OR 1=1 --".padEnd(43, 'a'), '../'.repeat(15)]) {
    assert.equal(looksLikeSessionToken(bad as string | undefined), false, String(bad))
  }
})

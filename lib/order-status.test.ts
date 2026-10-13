import assert from 'node:assert/strict'
import { test } from 'node:test'
import { allowedTransitions, canTransition, isOrderStatus, statusLabel } from './order-status'

test('alur status yang diizinkan', () => {
  assert.deepEqual(allowedTransitions('PENDING'), ['PAID', 'CANCELLED'])
  assert.deepEqual(allowedTransitions('PAID'), ['SHIPPED', 'CANCELLED'])
  assert.deepEqual(allowedTransitions('SHIPPED'), ['COMPLETED'])
  assert.deepEqual(allowedTransitions('COMPLETED'), [])
  assert.deepEqual(allowedTransitions('CANCELLED'), [])
  assert.deepEqual(allowedTransitions('NGAWUR'), [])
})

test('canTransition menolak lompatan dan status tak dikenal', () => {
  assert.equal(canTransition('PENDING', 'PAID'), true)
  assert.equal(canTransition('PENDING', 'SHIPPED'), false)
  assert.equal(canTransition('SHIPPED', 'CANCELLED'), false)
  assert.equal(canTransition('CANCELLED', 'PAID'), false)
  assert.equal(canTransition('PENDING', 'HACK'), false)
})

test('isOrderStatus & statusLabel', () => {
  assert.equal(isOrderStatus('PAID'), true)
  assert.equal(isOrderStatus('paid'), false)
  assert.equal(isOrderStatus(null), false)
  assert.equal(statusLabel('PENDING'), 'Menunggu pembayaran')
  assert.equal(statusLabel('LAIN'), 'LAIN')
})

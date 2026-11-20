import assert from 'node:assert/strict'
import test from 'node:test'
import formatDate, { getRouteAgeStatus } from './formatDate.js'

test('formats a Supabase midnight UTC timestamp without shifting its date', () => {
  assert.equal(formatDate('2026-09-28T00:00:00+00:00'), '09-28-2026')
  assert.equal(formatDate('2026-09-28'), '09-28-2026')
})

test('marks routes as new through the one-month anniversary', () => {
  const created = '2026-10-19T00:00:00+00:00'
  assert.equal(getRouteAgeStatus(created, '2026-10-18'), null)
  assert.equal(getRouteAgeStatus(created, '2026-10-19'), 'new')
  assert.equal(getRouteAgeStatus(created, '2026-11-19T23:59:59Z'), 'new')
  assert.equal(getRouteAgeStatus(created, '2026-11-20'), null)
})

test('warns from the nine-month anniversary and marks routes over a year old', () => {
  const created = '2025-11-19T00:00:00+00:00'
  assert.equal(getRouteAgeStatus(created, '2026-08-18'), null)
  assert.equal(getRouteAgeStatus(created, '2026-08-19'), 'aging')
  assert.equal(getRouteAgeStatus(created, '2026-11-19'), 'aging')
  assert.equal(getRouteAgeStatus(created, '2026-11-20'), 'overdue')
})

test('clamps a month-end anniversary to the last day of the target month', () => {
  assert.equal(getRouteAgeStatus('2025-01-31', '2025-02-28'), 'new')
  assert.equal(getRouteAgeStatus('2025-01-31', '2025-03-01'), null)
  assert.equal(getRouteAgeStatus('2024-05-31', '2025-02-28'), 'aging')
  assert.equal(getRouteAgeStatus('2024-02-29', '2025-02-28'), 'aging')
  assert.equal(getRouteAgeStatus('2024-02-29', '2025-03-01'), 'overdue')
})

// Run: node --experimental-strip-types --test tests/followUpTiming.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { followUpDueAt, dueCutoffAt, isSendDay } from '../src/lib/followUpTiming.ts';

// Dubai is UTC+4: '2026-11-20T17:00:00+04:00' is Friday 17:00 Dubai.
const d = (s: string) => new Date(s).toISOString();

test('Friday 17:00 download is due Wednesday 17:00', () => {
  assert.equal(followUpDueAt('2026-11-20T17:00:00+04:00').toISOString(), d('2026-11-25T17:00:00+04:00'));
});
test('Monday 10:00 download is due Thursday 10:00', () => {
  assert.equal(followUpDueAt('2026-11-16T10:00:00+04:00').toISOString(), d('2026-11-19T10:00:00+04:00'));
});
test('Sunday download counts from Monday 00:00 and is due Thursday 00:00', () => {
  assert.equal(followUpDueAt('2026-11-22T15:00:00+04:00').toISOString(), d('2026-11-26T00:00:00+04:00'));
});
test('Saturday download is due Thursday 00:00', () => {
  assert.equal(followUpDueAt('2026-11-21T09:00:00+04:00').toISOString(), d('2026-11-26T00:00:00+04:00'));
});
test('cutoff is the inverse of due', () => {
  for (const s of ['2026-11-16T10:00:00+04:00', '2026-11-20T17:00:00+04:00', '2026-11-18T23:30:00+04:00']) {
    const due = followUpDueAt(s);
    assert.equal(dueCutoffAt(due).toISOString(), d(s));
  }
});
test('weekend downloads are due at the Thursday 00:00 cutoff', () => {
  const cutoff = dueCutoffAt(new Date('2026-11-26T00:00:00+04:00')).getTime();
  assert.ok(new Date('2026-11-22T23:59:00+04:00').getTime() <= cutoff);
});
test('no sends on Saturday or Sunday Dubai', () => {
  assert.equal(isSendDay(new Date('2026-11-21T12:00:00+04:00')), false);
  assert.equal(isSendDay(new Date('2026-11-22T12:00:00+04:00')), false);
  assert.equal(isSendDay(new Date('2026-11-23T08:00:00+04:00')), true);
});

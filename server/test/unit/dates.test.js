import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  dbDateToYmd,
  isValidTimeZone,
  localParts,
  localYmd,
  startOfLocalDay,
  ymdToDbDate,
} from '../../src/utils/dates.js';

test('localYmd uses the user timezone, not UTC', () => {
  // 20:00 UTC on 5 Nov is already 6 Nov in India (+05:30).
  const instant = new Date('2026-11-05T20:00:00Z');
  assert.equal(localYmd('Asia/Kolkata', instant), '2026-11-06');
  assert.equal(localYmd('UTC', instant), '2026-11-05');
});

test('addDays crosses month and year boundaries', () => {
  assert.equal(addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29'); // leap year
});

test('startOfLocalDay returns the first instant of the requested calendar date', () => {
  const start = startOfLocalDay('Asia/Kolkata', '2026-11-06');
  assert.equal(start.toISOString(), '2026-11-05T18:30:00.000Z');
  assert.equal(localYmd('Asia/Kolkata', start), '2026-11-06');
});

test('localParts reports Monday as index 0 (matches daysMask bit 0)', () => {
  // 2026-11-05 is a Thursday, so index 3.
  const parts = localParts('Asia/Kolkata', new Date('2026-11-05T03:30:00Z'));
  assert.equal(parts.ymd, '2026-11-05');
  assert.equal(parts.weekdayIdx, 3);
  assert.equal(parts.hhmm, '09:00');
});

test('localParts uses 00:xx, not 24:xx, at midnight', () => {
  const parts = localParts('Asia/Kolkata', new Date('2026-11-04T18:30:00Z')); // 00:00 IST on 5 Nov
  assert.equal(parts.hhmm, '00:00');
  assert.equal(parts.ymd, '2026-11-05');
});

test('db date round trip stays on the same calendar day', () => {
  assert.equal(dbDateToYmd(ymdToDbDate('2026-11-05')), '2026-11-05');
});

test('isValidTimeZone accepts IANA names and rejects junk', () => {
  assert.equal(isValidTimeZone('Asia/Kolkata'), true);
  assert.equal(isValidTimeZone('Mars/Olympus'), false);
  assert.equal(isValidTimeZone(''), false);
});

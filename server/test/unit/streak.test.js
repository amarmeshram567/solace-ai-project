import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectiveStreak } from '../../src/services/gamification.service.js';
import { ymdToDbDate } from '../../src/utils/dates.js';

const streak = (last, currentDays = 4) => ({ lastActiveDate: last ? ymdToDbDate(last) : null, currentDays });

test('no activity means no streak', () => {
  assert.equal(effectiveStreak(null, '2026-11-05'), 0);
  assert.equal(effectiveStreak(streak(null), '2026-11-05'), 0);
});

test('active today or yesterday keeps the streak', () => {
  assert.equal(effectiveStreak(streak('2026-11-05'), '2026-11-05'), 4);
  assert.equal(effectiveStreak(streak('2026-11-04'), '2026-11-05'), 4);
});

test('missing a full day resets the displayed streak to zero', () => {
  assert.equal(effectiveStreak(streak('2026-11-03'), '2026-11-05'), 0);
});

test('a future last-active date (clock skew) does not count as an active streak', () => {
  // Only today or yesterday count, so a date ahead of "today" is not an active streak.
  assert.equal(effectiveStreak(streak('2026-11-06'), '2026-11-05'), 0);
});

test('streak survives the midnight boundary in the user timezone', () => {
  // Active on 4 Nov local time; checking on 5 Nov local time still counts.
  assert.equal(effectiveStreak(streak('2026-11-04'), '2026-11-05'), 4);
});

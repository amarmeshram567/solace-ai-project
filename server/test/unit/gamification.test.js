import { test } from 'node:test';
import assert from 'node:assert/strict';
import { awardXp, touchStreak } from '../../src/services/gamification.service.js';
import { ymdToDbDate, dbDateToYmd } from '../../src/utils/dates.js';

// In-memory stand-in for the Prisma calls the gamification functions make.
// It mirrors the unique key on (userId, sourceKey) and the increment behaviour.
function fakeXpTx() {
  const txns = [];
  const levels = new Map();
  return {
    txns,
    levels,
    xpTransaction: {
      findUnique: async ({ where: { userId_sourceKey } }) =>
        txns.find((t) => t.userId === userId_sourceKey.userId && t.sourceKey === userId_sourceKey.sourceKey) ?? null,
      create: async ({ data }) => {
        if (txns.some((t) => t.userId === data.userId && t.sourceKey === data.sourceKey)) {
          throw Object.assign(new Error('unique'), { code: 'P2002' });
        }
        txns.push(data);
        return data;
      },
    },
    userLevel: {
      upsert: async ({ where, update, create }) => {
        const cur = levels.get(where.userId);
        if (cur) {
          cur.totalXp += update.totalXp.increment;
        } else {
          levels.set(where.userId, { userId: where.userId, totalXp: create.totalXp, level: 1 });
        }
        return levels.get(where.userId);
      },
      update: async ({ where, data }) => Object.assign(levels.get(where.userId), data),
    },
  };
}

test('an award is recorded once per source key', async () => {
  const tx = fakeXpTx();
  const first = await awardXp(tx, 'u1', 'MOOD_CHECKIN', 10, 'mood:2026-11-05');
  const retry = await awardXp(tx, 'u1', 'MOOD_CHECKIN', 10, 'mood:2026-11-05');

  assert.equal(first.awarded, true);
  assert.equal(retry.awarded, false);
  assert.equal(tx.levels.get('u1').totalXp, 10, 'a retry must not add XP a second time');
  assert.equal(tx.txns.length, 1);
});

test('different source keys on the same day both award', async () => {
  const tx = fakeXpTx();
  await awardXp(tx, 'u1', 'MOOD_CHECKIN', 10, 'mood:2026-11-05');
  await awardXp(tx, 'u1', 'BREATHING_SESSION', 15, 'breathing:abc');
  assert.equal(tx.levels.get('u1').totalXp, 25);
});

test('crossing a threshold raises the stored level and reports leveledUp', async () => {
  const tx = fakeXpTx();
  await awardXp(tx, 'u1', 'JOURNALING', 90, 'seed');
  const result = await awardXp(tx, 'u1', 'WELLNESS_ACTIVITY', 20, 'activity:x');

  assert.equal(result.totalXp, 110);
  assert.equal(result.level, 2);
  assert.equal(result.leveledUp, true);
  assert.equal(tx.levels.get('u1').level, 2, 'stored level must match the XP total');
});

test('an award that stays inside a level does not report leveledUp', async () => {
  const tx = fakeXpTx();
  await awardXp(tx, 'u1', 'JOURNALING', 10, 'a');
  const result = await awardXp(tx, 'u1', 'JOURNALING', 10, 'b');
  assert.equal(result.leveledUp, false);
  assert.equal(result.level, 1);
});

test('users do not share XP', async () => {
  const tx = fakeXpTx();
  await awardXp(tx, 'u1', 'MOOD_CHECKIN', 10, 'mood:2026-11-05');
  await awardXp(tx, 'u2', 'MOOD_CHECKIN', 10, 'mood:2026-11-05');
  assert.equal(tx.levels.get('u1').totalXp, 10);
  assert.equal(tx.levels.get('u2').totalXp, 10);
});

// ---- streaks ----

function fakeStreakTx(initial) {
  let row = initial ? { ...initial } : null;
  return {
    get row() {
      return row;
    },
    userStreak: {
      upsert: async ({ create }) => {
        if (!row) row = { currentDays: 0, longestDays: 0, lastActiveDate: null, ...create };
        return row;
      },
      update: async ({ data }) => {
        row = { ...row, ...data };
        return row;
      },
    },
  };
}

test('first activity starts a streak at 1', async () => {
  const tx = fakeStreakTx();
  await touchStreak(tx, 'u1', '2026-11-05');
  assert.equal(tx.row.currentDays, 1);
  assert.equal(dbDateToYmd(tx.row.lastActiveDate), '2026-11-05');
});

test('activity on consecutive days extends the streak and the longest record', async () => {
  const tx = fakeStreakTx({ currentDays: 2, longestDays: 2, lastActiveDate: ymdToDbDate('2026-11-04') });
  await touchStreak(tx, 'u1', '2026-11-05');
  assert.equal(tx.row.currentDays, 3);
  assert.equal(tx.row.longestDays, 3);
});

test('a missed day restarts the streak but keeps the longest record', async () => {
  const tx = fakeStreakTx({ currentDays: 5, longestDays: 5, lastActiveDate: ymdToDbDate('2026-11-02') });
  await touchStreak(tx, 'u1', '2026-11-05');
  assert.equal(tx.row.currentDays, 1);
  assert.equal(tx.row.longestDays, 5);
});

test('several activities on the same day do not inflate the streak', async () => {
  const tx = fakeStreakTx({ currentDays: 3, longestDays: 3, lastActiveDate: ymdToDbDate('2026-11-05') });
  await touchStreak(tx, 'u1', '2026-11-05');
  await touchStreak(tx, 'u1', '2026-11-05');
  assert.equal(tx.row.currentDays, 3);
});

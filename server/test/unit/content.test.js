import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSESSMENTS, bandFor, maxScoreFor } from '../../src/content/assessments.js';
import { MOODS, MOOD_KEYS } from '../../src/content/moods.js';
import { ACHIEVEMENTS } from '../../src/content/achievements.js';
import { NOTIFICATION_COPY } from '../../src/content/notifications.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(here, '../../../mobile');

test('assessment bands are contiguous and cover every possible score', () => {
  for (const a of ASSESSMENTS) {
    const max = maxScoreFor(a);
    const bands = [...a.bands].sort((x, y) => x.min - y.min);
    assert.equal(bands[0].min, 0, `${a.slug} must start at 0`);
    assert.equal(bands[bands.length - 1].max, max, `${a.slug} must end at its max score ${max}`);
    for (let i = 1; i < bands.length; i++) {
      assert.equal(bands[i].min, bands[i - 1].max + 1, `${a.slug} has a gap or overlap at ${bands[i].min}`);
    }
  }
});

test('bandFor returns the right band at every boundary', () => {
  for (const a of ASSESSMENTS) {
    for (const band of a.bands) {
      assert.equal(bandFor(a, band.min), band, `${a.slug} min ${band.min}`);
      assert.equal(bandFor(a, band.max), band, `${a.slug} max ${band.max}`);
    }
  }
});

test('every mood has a label, a reflection, and an in-app suggestion', () => {
  for (const key of MOOD_KEYS) {
    const m = MOODS[key];
    assert.ok(m.label, `${key} label`);
    assert.ok(m.response && m.response.length > 20, `${key} response`);
    assert.ok(m.suggestion.deepLink.startsWith('/'), `${key} deep link`);
  }
});

test('mobile mood keys match the server mood keys exactly', () => {
  const src = readFileSync(path.join(mobileRoot, 'src/constants/moods.js'), 'utf8');
  const mobileKeys = [...src.matchAll(/^\s{2}([A-Z_]+): \{ label/gm)].map((m) => m[1]);
  assert.deepEqual([...mobileKeys].sort(), [...MOOD_KEYS].sort());
});

test('achievement keys are unique and every metric is one the progress service computes', () => {
  const computed = new Set(['moodEntries', 'breathingCompleted', 'activitiesCompleted', 'assessments', 'longestStreak', 'totalXp']);
  const keys = new Set();
  for (const a of ACHIEVEMENTS) {
    assert.ok(!keys.has(a.key), `duplicate key ${a.key}`);
    keys.add(a.key);
    assert.ok(computed.has(a.metric), `${a.key} uses unknown metric ${a.metric}`);
    assert.ok(a.target > 0, `${a.key} target must be positive`);
  }
});

test('every reminder deep link points to a real mobile screen', () => {
  // Maps an in-app path to the Expo Router file that must exist.
  const routeFile = {
    '/mood/checkin': 'app/mood/checkin.js',
    '/breathing': 'app/breathing.js',
    '/activities': 'app/activities/index.js',
    '/explore': 'app/(tabs)/explore.js',
    '/(tabs)': 'app/(tabs)/index.js',
  };
  for (const [type, copy] of Object.entries(NOTIFICATION_COPY)) {
    const base = copy.deepLink.split('?')[0];
    assert.ok(routeFile[base], `${type} links to ${copy.deepLink}, which the test does not know`);
    assert.ok(existsSync(path.join(mobileRoot, routeFile[base])), `${type}: ${routeFile[base]} is missing`);
  }
});

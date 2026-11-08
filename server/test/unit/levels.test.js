import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeXp, LEVELS } from '../../src/utils/levels.js';

test('level boundaries are exact', () => {
  assert.equal(describeXp(0).level, 1);
  assert.equal(describeXp(99).level, 1);
  assert.equal(describeXp(100).level, 2);
  assert.equal(describeXp(299).level, 2);
  assert.equal(describeXp(300).level, 3);
  assert.equal(describeXp(600).level, 4);
  assert.equal(describeXp(1000).level, 5);
});

test('progress within a level is a fraction from 0 to 1', () => {
  const mid = describeXp(200); // halfway from 100 to 300
  assert.equal(mid.levelName, 'Discovering');
  assert.equal(mid.progress, 0.5);
  assert.equal(mid.nextLevelXp, 300);
  assert.equal(mid.nextLevelName, 'Growing');
});

test('the top level has no next target and full progress', () => {
  const top = describeXp(5000);
  assert.equal(top.level, 5);
  assert.equal(top.nextLevelXp, null);
  assert.equal(top.nextLevelName, null);
  assert.equal(top.progress, 1);
});

test('negative and fractional XP are normalised', () => {
  assert.equal(describeXp(-50).totalXp, 0);
  assert.equal(describeXp(-50).level, 1);
  assert.equal(describeXp(99.9).totalXp, 99);
});

test('level thresholds are strictly increasing and start at zero', () => {
  assert.equal(LEVELS[0].minXp, 0);
  for (let i = 1; i < LEVELS.length; i++) {
    assert.ok(LEVELS[i].minXp > LEVELS[i - 1].minXp, `level ${LEVELS[i].level} must exceed the previous`);
    assert.equal(LEVELS[i].level, LEVELS[i - 1].level + 1);
  }
});

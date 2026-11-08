import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCrisisText, suggestionsFor } from '../../src/services/ai/safety.js';

test('crisis language is detected', () => {
  const positives = [
    'I want to die',
    'I have been thinking about suicide',
    'I keep wanting to hurt myself',
    'I think about self-harm a lot',
    'I might overdose',
    'I want to end my life',
    'I feel like I should kill myself',
  ];
  for (const text of positives) assert.equal(isCrisisText(text), true, text);
});

test('gaps in crisis detection are closed', () => {
  // These are common ways people describe the same risk without the exact keyword.
  const gaps = [
    "I'd be better off dead",
    'I just want to end it all',
    "I don't see any reason to live",
    'I wish I could disappear forever',
  ];
  for (const text of gaps) assert.equal(isCrisisText(text), true, text);
});

test('ordinary messages are not treated as crisis', () => {
  const negatives = ['I had a long day at work', 'My cat is sleeping', 'Can you teach me a breathing exercise?'];
  for (const text of negatives) assert.equal(isCrisisText(text), false, text);
});

test('suggestions never match inside unrelated words', () => {
  // "allow" contains "low"; it must not trigger the low-mood suggestion.
  const out = suggestionsFor("I don't allow myself any rest");
  assert.ok(!out.some((s) => s.deepLink === '/explore'), JSON.stringify(out));
});

test('suggestions are capped at two and link to in-app paths', () => {
  const out = suggestionsFor('I am anxious and stressed, I cannot sleep, I feel sad and worthless');
  assert.ok(out.length <= 2);
  for (const s of out) assert.ok(s.deepLink.startsWith('/'), s.deepLink);
});

test('suggestions are unique by destination', () => {
  const out = suggestionsFor('anxious anxious panic worried');
  assert.equal(new Set(out.map((s) => s.deepLink)).size, out.length);
});

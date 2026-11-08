import { CRISIS_PATTERNS } from '../../content/safety.js';

export function isCrisisText(text) {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

// Suggestions are chosen by simple, transparent keyword rules and always link to a
// real app screen. They are never presented as medical advice. Every pattern uses word
// boundaries so that, for example, "allow" does not match "low".
const RULES = [
  { match: /\b(sleep|sleeping|insomnia|can'?t rest|awake at night)\b/i, suggestion: { label: 'Try a sleep wind-down', deepLink: '/activities?category=BETTER_SLEEP' } },
  { match: /\b(anxious|anxiety|panic|worr(y|ied)|overwhelm(ed)?|racing thoughts)\b/i, suggestion: { label: 'Start a breathing exercise', deepLink: '/breathing' } },
  { match: /\b(stress|stressed|tense|pressure|burn(ed|t)? ?out)\b/i, suggestion: { label: 'Try a stress relief activity', deepLink: '/activities?category=STRESS_RELIEF' } },
  { match: /\b(worthless|not worth|not good enough|hate myself|confidence|kind to myself)\b/i, suggestion: { label: 'Try a self-kindness activity', deepLink: '/activities?category=SELF_LOVE' } },
  { match: /\b(sad|lonely|low|blue)\b/i, suggestion: { label: 'Browse gentle ideas for low days', deepLink: '/explore' } },
];

export function suggestionsFor(text) {
  const out = [];
  for (const rule of RULES) {
    if (rule.match.test(text) && !out.some((s) => s.deepLink === rule.suggestion.deepLink)) {
      out.push(rule.suggestion);
    }
    if (out.length === 2) break;
  }
  return out;
}

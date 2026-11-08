// Safety content for Zen Monk. Crisis messages are fixed text and are returned
// WITHOUT calling the model, so the most sensitive replies are never generated.

// Deliberately broad: a false positive shows a supportive message, which is the safer error.
export const CRISIS_PATTERNS = [
  /suicid/i,
  /kill (myself|me)\b/i,
  /end (my|this) life/i,
  /want to die/i,
  /don'?t want to (be alive|live|exist)/i,
  /better off dead/i,
  /end (it|things) all\b/i,
  /(no|any|a) reason to (live|go on|be alive)/i,
  /wish i (could|would) (just )?disappear|disappear forever/i,
  /hurt(ing)? myself/i,
  /self[- ]?harm/i,
  /cut(ting)? myself/i,
  /overdose/i,
];

export const CRISIS_RESPONSE =
  "I'm really glad you told me, and I'm concerned about you. I'm an AI companion, so I can't check on you or send help, but you deserve support from a person right now.\n\n" +
  "If you might act on these thoughts or feel unsafe, please call your local emergency number now (112 in India), or go to the nearest emergency department. " +
  "Reach out to someone you trust and ask them to stay with you. If you can, tell them exactly what you told me.\n\n" +
  'You do not have to carry this alone. Would you be willing to contact one of those people right now?';

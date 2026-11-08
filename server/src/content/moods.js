// Authored, reviewed reflections. These are fixed text, never generated, so every
// user sees the same supportive wording for a given mood.
export const MOODS = {
  HAPPY: {
    label: 'Happy',
    response: 'It is lovely to notice this. Let the good feeling settle in for a moment.',
    suggestion: { label: 'Write one thing you appreciated today', deepLink: '/explore' },
  },
  CALM: {
    label: 'Calm',
    response: 'Calm is worth savouring. Notice where you feel it in your body.',
    suggestion: { label: 'Take a short mindful pause', deepLink: '/activities?category=MINDFULNESS' },
  },
  GRATEFUL: {
    label: 'Grateful',
    response: 'Gratitude can make ordinary moments feel fuller. Thank you for noticing it.',
    suggestion: { label: 'Try a self-kindness moment', deepLink: '/activities?category=SELF_LOVE' },
  },
  NEUTRAL: {
    label: 'Neutral',
    response: 'Not every day needs a strong feeling. Steady is okay too.',
    suggestion: { label: 'Try a one-minute breathing break', deepLink: '/breathing' },
  },
  ANXIOUS: {
    label: 'Anxious',
    response: 'Anxiety can feel loud. You are not doing anything wrong by feeling it. Let us slow things down together.',
    suggestion: { label: 'Start a breathing exercise', deepLink: '/breathing' },
  },
  SAD: {
    label: 'Sad',
    response: 'It is okay to feel sad. Be gentle with yourself today. If this feeling lasts or gets heavier, talking with someone you trust or a professional can help.',
    suggestion: { label: 'Browse gentle ideas for low days', deepLink: '/explore' },
  },
  STRESSED: {
    label: 'Stressed',
    response: 'Stress is a lot to carry. Let us take the edge off, one breath at a time.',
    suggestion: { label: 'Try a stress relief activity', deepLink: '/activities?category=STRESS_RELIEF' },
  },
  OVERWHELMED: {
    label: 'Overwhelmed',
    response: 'When everything feels like too much, you do not have to solve it all right now. Pick the smallest next step.',
    suggestion: { label: 'Ground yourself with a breathing exercise', deepLink: '/breathing' },
  },
};

export const MOOD_KEYS = Object.keys(MOODS);

// Assessment content and transparent scoring. Each question is answered 0–3 where a
// higher number means "more of what the question describes". Scores are a simple sum,
// and category bands are shown to the user with the result.
//
// These are informal self-reflections written for Solace. They are NOT validated
// clinical instruments and do not diagnose anything.

export const SCALE = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'A little' },
  { value: 2, label: 'Quite a bit' },
  { value: 3, label: 'Almost always' },
];

export const ASSESSMENTS = [
  {
    slug: 'mood-vibes',
    kind: 'MOOD_VIBES',
    title: 'Mood Vibes',
    description: 'A short check on how your days have been feeling lately.',
    disclaimer: 'A wellness reflection for self-awareness. It is not a diagnosis.',
    questions: [
      'Over the past two weeks, how often have you felt cheerful or in good spirits?',
      'How often have you felt interested in things you usually enjoy?',
      'How often have you felt energetic?',
      'How often has your mood felt steady through the day?',
      'How often have you looked forward to the next day?',
    ],
    bands: [
      {
        min: 0, max: 5, category: 'Running low',
        summary: 'Your mood has felt heavy or flat lately. That is worth noticing, and you do not have to fix it alone.',
        recommendations: ['Choose one small thing that usually brings a little comfort.', 'Talk with someone you trust about how you have been.'],
        suggestion: { label: 'Browse gentle ideas for low days', deepLink: '/explore' },
      },
      {
        min: 6, max: 10, category: 'Mixed',
        summary: 'Some days feel good and others feel harder. That mix is very common.',
        recommendations: ['Notice what made your better days different.', 'Plan one enjoyable activity this week.'],
        suggestion: { label: 'Try a mindfulness moment', deepLink: '/activities?category=MINDFULNESS' },
      },
      {
        min: 11, max: 15, category: 'Brightening',
        summary: 'Your mood has been fairly steady and hopeful. Keep doing what supports you.',
        recommendations: ['Keep a short note of what helped this week.', 'Share a good moment with someone you care about.'],
        suggestion: { label: 'Build a gratitude habit', deepLink: '/activities?category=SELF_LOVE' },
      },
    ],
  },
  {
    slug: 'anxiety-check',
    kind: 'ANXIETY_CHECK',
    title: 'Anxiety Check',
    description: 'A gentle reflection on everyday tension, worry and restlessness.',
    disclaimer: 'This is an informal wellness reflection, not a clinical assessment. It cannot diagnose an anxiety disorder.',
    questions: [
      'How often have you felt restless or keyed up?',
      'How often have you found it hard to stop worrying?',
      'How often has it been difficult to relax?',
      'How often has it been hard to concentrate?',
      'How often has your sleep been disturbed by worry?',
      'How often have you felt overwhelmed by everyday things?',
    ],
    bands: [
      {
        min: 0, max: 5, category: 'Mostly calm',
        summary: 'Tension seems fairly manageable right now. Keep the habits that help you settle.',
        recommendations: ['Keep a simple wind-down routine in the evening.', 'Notice what keeps you steady.'],
        suggestion: { label: 'Try a breathing exercise', deepLink: '/breathing' },
      },
      {
        min: 6, max: 11, category: 'Some stress showing',
        summary: 'Stress is showing up in your body and thoughts. Small, regular practices can help.',
        recommendations: ['Try a grounding exercise when worry starts.', 'Take short movement or stretch breaks.'],
        suggestion: { label: 'Open the anxiety toolkit', deepLink: '/explore' },
      },
      {
        min: 12, max: 18, category: 'Stress is loud right now',
        summary: 'You may be carrying a lot. Be kind to yourself, and consider talking with a professional you trust if this continues.',
        recommendations: ['Use a breathing exercise several times a day.', 'Reach out to someone you trust or a qualified professional.'],
        suggestion: { label: 'Start a breathing exercise', deepLink: '/breathing' },
      },
    ],
  },
  {
    slug: 'self-love-meter',
    kind: 'SELF_LOVE_METER',
    title: 'Self-love Meter',
    description: 'How you accept, encourage and speak to yourself.',
    disclaimer: 'A self-reflection to notice patterns. It is not a judgement of your worth.',
    questions: [
      'How often do you accept your strengths and flaws together?',
      'How often do you feel confident in what you can do?',
      'How often do you treat yourself with kindness when you make mistakes?',
      'How often do you feel able to set healthy boundaries?',
      'How often is your inner voice encouraging rather than harsh?',
      'How often do you notice and celebrate your personal growth?',
    ],
    bands: [
      {
        min: 0, max: 6, category: 'Just beginning',
        summary: 'Being kinder to yourself is a skill, and beginning is enough. Every small kindness counts.',
        recommendations: ['Try one kind sentence to yourself each morning.', 'Notice one thing you handled well today.'],
        suggestion: { label: 'Open a self-kindness activity', deepLink: '/activities?category=SELF_LOVE' },
      },
      {
        min: 7, max: 12, category: 'Growing',
        summary: 'You are building a more supportive relationship with yourself. Keep noticing the progress.',
        recommendations: ['Name a boundary you would like to practise.', 'Write down one personal win each week.'],
        suggestion: { label: 'Read the self-esteem reset', deepLink: '/explore' },
      },
      {
        min: 13, max: 18, category: 'Blossoming',
        summary: 'You are treating yourself with real warmth and respect. Carry that into the days ahead.',
        recommendations: ['Share encouragement with someone else.', 'Revisit your goals and celebrate how far you have come.'],
        suggestion: { label: 'Explore new growth ideas', deepLink: '/explore' },
      },
    ],
  },
];

export const maxScoreFor = (assessment) => assessment.questions.length * 3;

export function bandFor(assessment, total) {
  return assessment.bands.find((b) => total >= b.min && total <= b.max) ?? assessment.bands[assessment.bands.length - 1];
}

// Authored wellness content. Each resource is a structured document with sections;
// each activity has short, timed steps. Explicit safety notes are included where a
// technique could be misused.

export const ACTIVITIES = [
  {
    slug: 'body-scan-short',
    title: 'Three-minute body scan',
    description: 'Move your attention slowly from your feet to your head, noticing without needing to change anything.',
    category: 'MINDFULNESS',
    durationSec: 180,
    xpReward: 20,
    steps: [
      { text: 'Sit or lie down somewhere comfortable.' },
      { text: 'Notice your feet and the floor beneath them for 20 seconds.' },
      { text: 'Slowly move your attention up through your legs, belly and chest.' },
      { text: 'Notice your shoulders, hands, neck and face.' },
      { text: 'Take one slow breath and open your eyes when you are ready.' },
    ],
  },
  {
    slug: 'kind-words-note',
    title: 'Two-minute kind words',
    description: 'Write or say one sentence you would say to a good friend who was having a hard day.',
    category: 'SELF_LOVE',
    durationSec: 120,
    xpReward: 20,
    steps: [
      { text: 'Think of something that has been difficult lately.' },
      { text: 'Imagine a close friend telling you about the same situation.' },
      { text: 'Write the kind sentence you would offer them.' },
      { text: 'Read it to yourself once, slowly.' },
    ],
  },
  {
    slug: 'grounding-54321',
    title: '5-4-3-2-1 grounding',
    description: 'Use your senses to come back to the present when your thoughts race.',
    category: 'STRESS_RELIEF',
    durationSec: 300,
    xpReward: 20,
    steps: [
      { text: 'Name 5 things you can see around you.' },
      { text: 'Name 4 things you can feel, such as your feet on the floor.' },
      { text: 'Name 3 things you can hear.' },
      { text: 'Name 2 things you can smell.' },
      { text: 'Name 1 thing you can taste, or take a sip of water.' },
    ],
  },
  {
    slug: 'wind-down-dim-lights',
    title: 'Dim the lights, slow the day',
    description: 'A short routine to signal to your body that the day is ending.',
    category: 'BETTER_SLEEP',
    durationSec: 300,
    xpReward: 20,
    steps: [
      { text: 'Dim the lights or switch to a warm, low light.' },
      { text: 'Put your phone out of reach or on silent.' },
      { text: 'Write down three things still on your mind, to be picked up tomorrow.' },
      { text: 'Take five slow breaths, making each exhale a little longer.' },
    ],
  },
];

export const RESOURCES = [
  {
    slug: 'mindfulness-101',
    title: 'Mindfulness 101',
    summary: 'What mindfulness is, and simple ways to practise present-moment awareness.',
    sections: [
      { heading: 'What mindfulness is', body: 'Mindfulness means paying attention to the present moment on purpose, with curiosity and without judging what you notice.' },
      { heading: 'Present-moment awareness', body: 'Notice what is happening right now: the sounds around you, the temperature of the air, the weight of your body. When your mind wanders, gently bring it back.' },
      { heading: 'Guided grounding', body: 'Pause, feel both feet on the floor, and take three slow breaths. Notice how your body feels before you move on.', steps: ['Feel your feet on the floor.', 'Take three slow breaths.', 'Name one thing you notice right now.'] },
      { heading: 'Try this', body: 'Choose one routine moment today, such as brushing your teeth or making tea, and give it your full attention.' },
    ],
  },
  {
    slug: 'anxiety-toolkit',
    title: 'Anxiety Toolkit',
    summary: 'General calming techniques for everyday tension. These support, and do not replace, professional care.',
    sections: [
      { heading: 'About these techniques', body: 'These are general wellness techniques. They are not a substitute for professional treatment. If anxiety is affecting your daily life, please talk with a qualified professional.' },
      { heading: '5-4-3-2-1 grounding', body: 'Use your senses to come back to the present.', steps: ['Name 5 things you can see.', 'Name 4 things you can feel.', 'Name 3 things you can hear.', 'Name 2 things you can smell.', 'Name 1 thing you can taste.'] },
      { heading: '4-7-8 breathing', body: 'Breathe in through your nose for 4 counts, hold for 7, then exhale slowly through your mouth for 8. Repeat up to four times.' },
      { heading: 'Name the thought', body: 'When a worry repeats, say to yourself, "I am noticing the thought that…" and finish the sentence. Naming a thought can create a little space around it.' },
      { heading: 'Cool water, for calm only', body: 'Splashing cool water on your face or holding a cool cloth to your cheeks can help your body settle. Use it only for calm. If you feel tempted to use pain, shock or harm to cope with distress, please talk to someone you trust right away.' },
    ],
  },
  {
    slug: 'beating-the-blues',
    title: 'Beating the Blues',
    summary: 'Ideas for low moods: small goals, gratitude and journaling. These can support you alongside care.',
    sections: [
      { heading: 'Understanding low moods', body: 'Low mood is common and can feel heavy. It is not a personal failing. If it lasts for weeks or interferes with your life, please speak with a doctor or mental health professional. Simple ideas here are support, not a cure.' },
      { heading: 'Daily activity', body: 'Even a short walk, a shower, or a call with someone can shift things a little. Choose one thing that feels doable today.' },
      { heading: 'Small achievable goals', body: 'Pick a goal small enough to finish in 10 minutes. Finishing it counts.', steps: ['Choose one small task.', 'Set a timer for 10 minutes.', 'Notice and acknowledge when you finish.'] },
      { heading: 'Gratitude practice', body: 'Write down three things, however small, that went okay today.' },
      { heading: 'Journaling', body: 'Write freely for five minutes about how you feel, without editing. You do not have to share it with anyone.' },
    ],
  },
  {
    slug: 'self-esteem-reset',
    title: 'Self-esteem Reset',
    summary: 'Build a kinder inner voice, recognise your strengths and practise healthy boundaries.',
    sections: [
      { heading: 'Positive self-talk', body: 'Notice the words you use about yourself. Replace one harsh phrase with a more honest, kinder one. For example, "I always mess up" can become "I made a mistake, and I can learn from it."' },
      { heading: 'Self-compassion', body: 'Treat yourself the way you would treat a friend. Acknowledge that struggling is part of being human.' },
      { heading: 'Strength recognition', body: 'List three strengths you used in the past month, with one example each.', steps: ['Write three strengths.', 'Give one example for each.', 'Keep the list where you will see it.'] },
      { heading: 'Personal boundaries', body: 'A boundary is a limit that protects your energy. Practise saying, "I can\'t do that right now," when a request does not work for you.' },
      { heading: 'Confidence-building', body: 'Choose one small thing you have been putting off and do the first step today.' },
    ],
  },
  {
    slug: 'sleep-wind-down',
    title: 'Sleep Wind-down',
    summary: 'A calming evening routine for better rest.',
    sections: [
      { heading: 'Dim everything', body: 'Lower the lights an hour before bed. Warm, dim light helps your body prepare for sleep.' },
      { heading: 'Brain dump', body: 'Write down what is on your mind and one next step for each item. Closing the notebook tells your brain it can rest.' },
      { heading: 'Body scan', body: 'Lie down and notice each part of your body, releasing tension as you go. Stop when you feel heavy and calm.' },
      { heading: 'Same wake time', body: 'Waking at a consistent time, even after a restless night, helps your body clock settle over time.' },
      { heading: 'Relaxation routine', body: 'Repeat the same few steps each night, such as a warm drink, a short stretch, then the body scan. Familiar routines signal sleep.', steps: ['Dim the lights.', 'Do your brain dump.', 'Do the body scan.', 'Set your wake time and rest.'] },
    ],
  },
];

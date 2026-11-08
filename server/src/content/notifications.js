// Reminder copy. Kept gentle and free of guilt or streak pressure.
export const NOTIFICATION_COPY = {
  DAILY_MOOD_CHECKIN: { title: 'How are you feeling today?', body: 'A quick check-in helps you notice patterns.', deepLink: '/mood/checkin' },
  DAILY_AFFIRMATION: { title: 'Your affirmation is ready', body: "Take a moment with today's kind words.", deepLink: '/(tabs)' },
  BREATHING_REMINDER: { title: 'A moment to breathe', body: 'A short breathing session can help you reset.', deepLink: '/breathing' },
  SELF_CARE_REMINDER: { title: 'A small self-care step', body: 'Pick one gentle activity for today, if you like.', deepLink: '/activities' },
  CUSTOM_REMINDER: { title: 'Reminder', body: 'Here is the reminder you set.', deepLink: '/(tabs)' },
};

export const MAX_CUSTOM_REMINDERS = 10;

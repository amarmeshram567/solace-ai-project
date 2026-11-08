// Milestones are computed from real records every time they are requested, so nothing
// is awarded or stored separately. `metric` names a value calculated in progress.service.
export const ACHIEVEMENTS = [
  { key: 'first-checkin', title: 'First check-in', description: 'Record your first mood.', metric: 'moodEntries', target: 1 },
  { key: 'checkins-10', title: 'Ten check-ins', description: 'Record ten moods over time.', metric: 'moodEntries', target: 10 },
  { key: 'first-breath', title: 'First breath', description: 'Finish a breathing session.', metric: 'breathingCompleted', target: 1 },
  { key: 'breath-10', title: 'Steady breather', description: 'Finish ten breathing sessions.', metric: 'breathingCompleted', target: 10 },
  { key: 'first-activity', title: 'First step', description: 'Complete a wellness activity.', metric: 'activitiesCompleted', target: 1 },
  { key: 'first-reflection', title: 'First reflection', description: 'Complete a self-reflection.', metric: 'assessments', target: 1 },
  { key: 'streak-3', title: 'Three days in a row', description: 'Stay active for three days.', metric: 'longestStreak', target: 3 },
  { key: 'streak-7', title: 'A week of care', description: 'Stay active for seven days.', metric: 'longestStreak', target: 7 },
  { key: 'level-3', title: 'Growing', description: 'Reach level 3.', metric: 'totalXp', target: 300 },
  { key: 'level-5', title: 'Thriving', description: 'Reach level 5.', metric: 'totalXp', target: 1000 },
];

import { colors } from '../theme';

// The four Wellness Moves from the reference. Each maps to a server activity category.
export const WELLNESS_MOVES = [
  { key: 'mindfulness', title: 'Mindfulness', subtitle: 'Slow down and notice', tint: colors.lavender, category: 'MINDFULNESS' },
  { key: 'self-love', title: 'Self-love', subtitle: 'Kind words for you', tint: colors.coral, category: 'SELF_LOVE' },
  { key: 'stress-relief', title: 'Stress Relief', subtitle: 'Ease the pressure', tint: colors.skyBlue, category: 'STRESS_RELIEF' },
  { key: 'better-sleep', title: 'Better Sleep', subtitle: 'Wind down gently', tint: colors.warmYellow, category: 'BETTER_SLEEP' },
];

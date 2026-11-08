// Self-love levels. Calculated on the server so every client shows the same result.
// Thresholds are the minimum total XP for each level; tune them with product input.
export const LEVELS = [
  { level: 1, name: 'Beginning', minXp: 0 },
  { level: 2, name: 'Discovering', minXp: 100 },
  { level: 3, name: 'Growing', minXp: 300 },
  { level: 4, name: 'Blossoming', minXp: 600 },
  { level: 5, name: 'Thriving', minXp: 1000 },
];

export function describeXp(totalXp) {
  const xp = Math.max(0, Math.floor(totalXp));
  const idx = LEVELS.reduce((acc, l, i) => (xp >= l.minXp ? i : acc), 0);
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;

  const span = next ? next.minXp - current.minXp : 1;
  const progress = next ? (xp - current.minXp) / span : 1;

  return {
    totalXp: xp,
    level: current.level,
    levelName: current.name,
    levelFloorXp: current.minXp,
    nextLevelXp: next?.minXp ?? null,
    nextLevelName: next?.name ?? null,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

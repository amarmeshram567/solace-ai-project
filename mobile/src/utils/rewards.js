// Human-readable XP reward line. Empty string when nothing was awarded, so the
// UI never celebrates a reward that did not happen.
export function rewardText(reward) {
  if (!reward?.awarded) return '';
  const base = `+${reward.amount} XP`;
  return reward.leveledUp && reward.levelName ? `${base} · You reached ${reward.levelName}` : base;
}

// Unique-enough id for idempotent submissions (server requires at least 8 characters).
export function newRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

// RuneScape-style XP curve. Level 99 ≈ 13M xp.

export const MAX_LEVEL = 99;

function cumulativeXp(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += Math.floor(l + 300 * Math.pow(2, l / 7));
  }
  return Math.floor(total / 4);
}

// Precompute the cumulative-xp threshold for each level (index 0 => level 1).
const TABLE: number[] = [];
for (let l = 1; l <= MAX_LEVEL; l++) TABLE.push(cumulativeXp(l));

export function xpForLevel(level: number): number {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, level));
  return TABLE[clamped - 1];
}

export function levelForXp(xp: number): number {
  let level = 1;
  for (let l = 1; l <= MAX_LEVEL; l++) {
    if (xp >= TABLE[l - 1]) level = l;
    else break;
  }
  return level;
}

/** Progress 0..1 of `xp` between its current level and the next. */
export function levelProgress(xp: number): number {
  const level = levelForXp(xp);
  if (level >= MAX_LEVEL) return 1;
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return (xp - cur) / (next - cur);
}

// RuneScape-style XP curve. Level 99 ≈ 13M xp.

export const MAX_LEVEL = 99;
export const MAIN_LANG_CAP = 110;     // 得意言語の上限
export const INTEREST_LANG_CAP = 120; // 興味ある言語の上限（最大）

const TABLE_MAX = INTEREST_LANG_CAP;

function cumulativeXp(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += Math.floor(l + 300 * Math.pow(2, l / 7));
  }
  return Math.floor(total / 4);
}

// Precompute the cumulative-xp threshold for each level (index 0 => level 1).
const TABLE: number[] = [];
for (let l = 1; l <= TABLE_MAX; l++) TABLE.push(cumulativeXp(l));

export function xpForLevel(level: number, cap = MAX_LEVEL): number {
  const clamped = Math.max(1, Math.min(cap, level));
  return TABLE[clamped - 1];
}

export function levelForXp(xp: number, cap = MAX_LEVEL): number {
  let level = 1;
  for (let l = 1; l <= cap; l++) {
    if (xp >= TABLE[l - 1]) level = l;
    else break;
  }
  return level;
}

/** Language affinity XP multiplier. +20% for mainLang, +10% for interestLangs. */
export function langXpMult(
  mainLang: string | null,
  interestLangs: string[],
  skillId: string,
): number {
  if (mainLang === skillId) return 1.20;
  if (interestLangs.includes(skillId)) return 1.10;
  return 1.0;
}

/** Level cap for a skill based on language affinity. */
export function langLevelCap(
  mainLang: string | null,
  interestLangs: string[],
  skillId: string,
): number {
  if (mainLang === skillId) return MAIN_LANG_CAP;
  if (interestLangs.includes(skillId)) return INTEREST_LANG_CAP;
  return MAX_LEVEL;
}

/** Progress 0..1 of `xp` between its current level and the next. */
export function levelProgress(xp: number, cap = MAX_LEVEL): number {
  const level = levelForXp(xp, cap);
  if (level >= cap) return 1;
  const cur = xpForLevel(level, cap);
  const next = xpForLevel(level + 1, cap);
  return (xp - cur) / (next - cur);
}

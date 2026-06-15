import type { SaveState } from "./types";
import { SKILLS } from "./data";
import { levelForXp } from "./xp";

export interface Rank {
  index: number;
  name: string;
  /** 必要な総合熟練度（全スキルレベルの合計）。 */
  total: number;
}

// 出世の縦軸。総合熟練度（全スキルLvの合計）で昇進。
export const RANKS: Rank[] = [
  { index: 0, name: "見習い", total: 0 },
  { index: 1, name: "ジュニア", total: 30 },
  { index: 2, name: "ミドル", total: 80 },
  { index: 3, name: "シニア", total: 160 },
  { index: 4, name: "テックリード", total: 280 },
  { index: 5, name: "マネージャ", total: 450 },
  { index: 6, name: "CTO", total: 700 },
];

/** 全スキルレベルの合計。 */
export function totalLevel(state: SaveState): number {
  let sum = 0;
  for (const s of SKILLS) sum += levelForXp(state.skills[s.id]?.xp ?? 0);
  return sum;
}

export function rankForTotal(total: number): Rank {
  let r = RANKS[0];
  for (const rank of RANKS) if (total >= rank.total) r = rank;
  return r;
}

export function currentRank(state: SaveState): Rank {
  return rankForTotal(totalLevel(state));
}

export function nextRank(state: SaveState): Rank | null {
  const cur = currentRank(state);
  return RANKS[cur.index + 1] ?? null;
}

/** 採用できる部下の上限（役職ランクで解禁）。シニア(3)で1人〜。 */
export function maxSubordinates(rankIndex: number): number {
  if (rankIndex >= 6) return 6; // CTO
  if (rankIndex >= 5) return 4; // マネージャ
  if (rankIndex >= 4) return 3; // テックリード
  if (rankIndex >= 3) return 2; // シニア
  if (rankIndex >= 2) return 1; // ミドルでお試し1人
  return 0;
}


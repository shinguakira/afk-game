import type { SaveState } from "./types";
import { currentRank, totalLevel } from "./rank";

/** 起業(プレステージ)に必要な最低役職ランク。3 = シニア。 */
export const PRESTIGE_MIN_RANK = 3;

/** 今起業したら得られるストック数。 */
export function prestigeGain(state: SaveState): number {
  const rank = currentRank(state);
  if (rank.index < PRESTIGE_MIN_RANK) return 0;
  return Math.floor(totalLevel(state) / 20) + rank.index * 2;
}

export function canPrestige(state: SaveState): boolean {
  return currentRank(state).index >= PRESTIGE_MIN_RANK;
}

import type { SaveState } from "../types/save";
import { currentRank, totalLevel } from "./rank";

// 決定(SPEC 0-11①): 起業はいつでも可能（ランクゲート無し）。
// ただし力不足での起業はストックが少なく旨味が無い（将来は生活費デバフも直結）。

/** 今起業したら得られるストック数。準備が浅いほど少ない。 */
export function prestigeGain(state: SaveState): number {
  return Math.floor(totalLevel(state) / 20) + currentRank(state).index * 2;
}

/** 起業に値する“準備度”の目安（UIの警告用）。シニア未満は準備不足とみなす。 */
export function isUnderPrepared(state: SaveState): boolean {
  return currentRank(state).index < 3;
}

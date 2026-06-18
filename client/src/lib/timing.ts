// アクションの所要時間/XP と畑の成長レート。リアルタイム(tick)とオフライン(progression)で
// 同一ロジックを使うための共通化（補正の二重実装による不整合を防ぐ）。
import type { SaveState } from "../types/save";
import type { GameAction } from "../types/skills";
import { ACTION_MAP, isCraftAction } from "../constants/maps";
import { mult } from "./modifiers";
import type { Effects } from "../types/effects";
import { TEND_BOOST } from "../constants/farming";

export interface ActionTiming {
  /** inputs を持つ＝制作扱い（craft 補正）。それ以外は生産(gather)補正。 */
  isCraft: boolean;
  /** 補正適用後の1完了あたり所要時間(ms)。 */
  effTime: number;
  /** 補正適用後の1完了あたり獲得XP。 */
  xpPer: number;
}

export function actionTiming(action: GameAction, eff: Effects): ActionTiming {
  const isCraft = isCraftAction(action);
  const effTime = action.time / mult(eff, isCraft ? "speed.craft" : "speed.gather");
  const xpPer = action.xp * mult(eff, isCraft ? "xp.craft" : "xp.gather");
  return { isCraft, effTime, xpPer };
}

/** 畑の成長レート: 手入れ中(active=farming)なら TEND_BOOST 倍、それ以外は等倍。 */
export function plotGrowthRate(state: SaveState): number {
  const tending =
    state.active?.kind === "skill" && ACTION_MAP[state.active.actionId]?.skill === "farming";
  return tending ? TEND_BOOST : 1;
}

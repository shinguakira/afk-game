import type { GameAction } from "../types";
import { buildActions } from "./techtree";

// 全アクションは techtree から生成（言語ごとの base/concept/library/framework/oss/cert）。
export const ACTIONS: GameAction[] = buildActions();

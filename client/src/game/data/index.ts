import type { GameAction, Item, Monster, Skill } from "../types";
import type { JobClass } from "./classes";
import { ITEMS } from "./items";
import { SKILLS } from "./skills";
import { ACTIONS } from "./actions";
import { MONSTERS } from "./monsters";
import { CLASSES } from "./classes";
import { CATEGORIES } from "./categories";
import { PRESTIGE_UPGRADES } from "./prestige";
import type { PrestigeUpgrade } from "./prestige";

export { ITEMS, SKILLS, MONSTERS, CLASSES, CATEGORIES, PRESTIGE_UPGRADES };
export type { SkillCategoryDef } from "./categories";

/** 制作(craft)判定: 入力を消費するアクションは制作扱い（フレームワーク/料理/PC組み立て）。
 *  それ以外（言語の基礎/概念/ライブラリ/OSS/資格）は生産(gather)。職種等の補正分岐に使う。 */
export function isCraftAction(a: GameAction): boolean {
  return !!a.inputs;
}
export { STAT, COMBAT_STAT_IDS } from "./skills";
export type { JobClass } from "./classes";
export type { PrestigeUpgrade } from "./prestige";

export const CLASS_MAP: Record<string, JobClass> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c]),
);

export const PRESTIGE_MAP: Record<string, PrestigeUpgrade> = Object.fromEntries(
  PRESTIGE_UPGRADES.map((p) => [p.id, p]),
);

// Lookup maps for O(1) access by id.
export const ITEM_MAP: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
export const SKILL_MAP: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const ACTION_MAP: Record<string, GameAction> = Object.fromEntries(
  ACTIONS.map((a) => [a.id, a]),
);
export const MONSTER_MAP: Record<string, Monster> = Object.fromEntries(
  MONSTERS.map((m) => [m.id, m]),
);

/** 大分類 id → スキル一覧（サイドバーの折りたたみ用）。 */
export const SKILLS_BY_CATEGORY: Record<string, Skill[]> = (() => {
  const acc: Record<string, Skill[]> = {};
  for (const c of CATEGORIES) acc[c.id] = [];
  for (const s of SKILLS) {
    if (acc[s.category]) acc[s.category].push(s);
  }
  return acc;
})();

export const ACTIONS_BY_SKILL: Record<string, GameAction[]> = ACTIONS.reduce(
  (acc, a) => {
    (acc[a.skill] ??= []).push(a);
    return acc;
  },
  {} as Record<string, GameAction[]>,
);

// id→定義の O(1) ルックアップマップ等（コンテンツ配列から計算する派生値）。バレルではない。
import type { GameAction, Skill } from "@/types/skills";
import type { Item } from "@/types/items";
import type { Monster } from "@/types/monsters";
import type { JobClass } from "@/constants/classes";
import type { PrestigeUpgrade } from "@/constants/prestige";
import { ITEMS } from "@/constants/items";
import { SKILLS } from "@/constants/skills";
import { ACTIONS } from "@/constants/actions";
import { MONSTERS } from "@/constants/monsters";
import { CLASSES } from "@/constants/classes";
import { CATEGORIES } from "@/constants/categories";
import { PRESTIGE_UPGRADES } from "@/constants/prestige";

/** 制作(craft)判定: 入力を消費するアクションは制作扱い（フレームワーク/料理/PC組み立て）。
 *  それ以外（言語の基礎/概念/ライブラリ/OSS/資格）は生産(gather)。職種等の補正分岐に使う。 */
export function isCraftAction(a: GameAction): boolean {
  return !!a.inputs;
}

export const CLASS_MAP: Record<string, JobClass> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c]),
);
export const PRESTIGE_MAP: Record<string, PrestigeUpgrade> = Object.fromEntries(
  PRESTIGE_UPGRADES.map((p) => [p.id, p]),
);
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

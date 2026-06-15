import type { Skill } from "../types";
import { buildLangSkills } from "./techtree";

// 言語スキル（techtree から生成）＋ 現場力(combat ステ)。
// フレームワーク/ライブラリ/概念は独立スキルではなく、言語スキル配下のアクション。
export const SKILLS: Skill[] = [
  ...buildLangSkills(),
  // 生活・クラフト系（言語ではない制作スキル）
  { id: "cooking", name: "料理", kind: "craft", icon: "cooking" },
  { id: "pcbuild", name: "PC組み立て", kind: "craft", icon: "pcbuild" },
  // 現場力
  { id: "debug", name: "デバッグ力", kind: "combat", icon: "debug" },
  { id: "impl", name: "実装力", kind: "combat", icon: "impl" },
  { id: "robust", name: "堅牢性", kind: "combat", icon: "robust" },
  { id: "mental", name: "メンタル", kind: "combat", icon: "mental" },
];

/** Combat mechanics → themed skill ids. */
export const STAT = {
  accuracy: "debug",
  damage: "impl",
  defence: "robust",
  mental: "mental",
} as const;

export const COMBAT_STAT_IDS = [
  STAT.accuracy,
  STAT.damage,
  STAT.defence,
  STAT.mental,
] as const;

export const STARTING_MENTAL_LEVEL = 10;

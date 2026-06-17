import type { Skill } from "../types";
import { buildLangSkills } from "./techtree";
import { INFRA_SKILLS, PLATFORM_SKILLS, DOMAIN_SKILLS, SOLDERING_SKILL } from "./sectors";

export const SKILLS: Skill[] = [
  // 言語（techtree から生成）
  ...buildLangSkills(),
  // 領域・プラットフォーム（何を作るか）
  ...PLATFORM_SKILLS,
  // インフラ・基盤（どこで動かすか）
  ...INFRA_SKILLS,
  // 業界ドメイン（誰のために）
  ...DOMAIN_SKILLS,
  // クラフト
  { id: "cooking", name: "料理", kind: "craft", category: "craft", icon: "cooking" },
  { id: "pcbuild", name: "PC組み立て", kind: "craft", category: "craft", icon: "pcbuild" },
  SOLDERING_SKILL,
  // 現場力（combat ステ）
  { id: "debug", name: "デバッグ力", kind: "combat", category: "combat", icon: "debug" },
  { id: "impl", name: "実装力", kind: "combat", category: "combat", icon: "impl" },
  { id: "robust", name: "堅牢性", kind: "combat", category: "combat", icon: "robust" },
  { id: "mental", name: "メンタル", kind: "combat", category: "combat", icon: "mental" },
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

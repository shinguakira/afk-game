import type { Skill } from "../types";

export const SKILLS: Skill[] = [
  // --- 生産 (gather): 放置で資源を生む ---
  { id: "learning", name: "学習", kind: "gather", icon: "📚" },
  { id: "coding", name: "コーディング", kind: "gather", icon: "⌨️" },
  { id: "research", name: "情報収集", kind: "gather", icon: "🔍" },
  { id: "caffeine", name: "カフェイン精製", kind: "gather", icon: "☕" },

  // --- 制作 (craft): 資源を成果物に組み立てる ---
  { id: "design", name: "設計", kind: "craft", icon: "📐" },
  { id: "development", name: "開発", kind: "craft", icon: "🏗️" },
  { id: "testing", name: "テスト", kind: "craft", icon: "🧪" },
  { id: "devops", name: "環境構築", kind: "craft", icon: "🔧" },

  // --- 遂行能力 (combat stats): 案件をこなして育つ ---
  { id: "debug", name: "デバッグ力", kind: "combat", icon: "🐞" },
  { id: "impl", name: "実装力", kind: "combat", icon: "🔨" },
  { id: "robust", name: "堅牢性", kind: "combat", icon: "🛡️" },
  { id: "mental", name: "メンタル", kind: "combat", icon: "🧠" },
];

/**
 * Single source of truth mapping combat *mechanics* to themed skill ids.
 * The engine references these (not string literals) so the theme can change
 * without touching combat math.
 *   accuracy → hit chance, damage → max hit, defence → mitigation, mental → max HP
 */
export const STAT = {
  accuracy: "debug",
  damage: "impl",
  defence: "robust",
  mental: "mental",
} as const;

/** All combat-stat skill ids (for XP granting / level math). */
export const COMBAT_STAT_IDS = [
  STAT.accuracy,
  STAT.damage,
  STAT.defence,
  STAT.mental,
] as const;

/** メンタルは初期 Lv10（いきなり燃え尽きないように）。 */
export const STARTING_MENTAL_LEVEL = 10;

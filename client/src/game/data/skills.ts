import type { Skill } from "../types";

// スキル = 実際の技術スタック。分野(domain)ごとに 言語(language) と
// フレームワーク(framework) を個別にレベリングする。フレームワークは
// アクション側で対応言語のレベルを要求する（actions.ts の requires）。
export const SKILLS: Skill[] = [
  // ===== Web =====
  { id: "js", name: "JavaScript", kind: "gather", tech: "language", domain: "web", icon: "javascript" },
  { id: "ts", name: "TypeScript", kind: "gather", tech: "language", domain: "web", icon: "typescript" },
  { id: "react", name: "React", kind: "craft", tech: "framework", domain: "web", icon: "react" },
  { id: "node", name: "Node.js", kind: "craft", tech: "framework", domain: "web", icon: "node" },

  // ===== ゲーム =====
  { id: "csharp", name: "C#", kind: "gather", tech: "language", domain: "game", icon: "csharp" },
  { id: "cpp", name: "C++", kind: "gather", tech: "language", domain: "game", icon: "cpp" },
  { id: "unity", name: "Unity", kind: "craft", tech: "framework", domain: "game", icon: "unity" },
  { id: "unreal", name: "Unreal Engine", kind: "craft", tech: "framework", domain: "game", icon: "unreal" },

  // ===== 組み込み =====
  { id: "c", name: "C", kind: "gather", tech: "language", domain: "embedded", icon: "c" },
  { id: "rust", name: "Rust", kind: "gather", tech: "language", domain: "embedded", icon: "rust" },
  { id: "arduino", name: "Arduino", kind: "craft", tech: "framework", domain: "embedded", icon: "arduino" },
  { id: "embassy", name: "Embassy (Rust)", kind: "craft", tech: "framework", domain: "embedded", icon: "rust" },

  // ===== AI・データ =====
  { id: "python", name: "Python", kind: "gather", tech: "language", domain: "ai", icon: "python" },
  { id: "pandas", name: "pandas", kind: "craft", tech: "framework", domain: "ai", icon: "pandas" },
  { id: "pytorch", name: "PyTorch", kind: "craft", tech: "framework", domain: "ai", icon: "pytorch" },
  { id: "tensorflow", name: "TensorFlow", kind: "craft", tech: "framework", domain: "ai", icon: "tensorflow" },

  // ===== 現場力 (combat stats) =====
  { id: "debug", name: "デバッグ力", kind: "combat", icon: "debug" },
  { id: "impl", name: "実装力", kind: "combat", icon: "impl" },
  { id: "robust", name: "堅牢性", kind: "combat", icon: "robust" },
  { id: "mental", name: "メンタル", kind: "combat", icon: "mental" },
];

/**
 * Single source of truth mapping combat *mechanics* to themed skill ids.
 *   accuracy → hit chance, damage → max hit, defence → mitigation, mental → max HP
 */
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

/** メンタルは初期 Lv10（いきなり燃え尽きないように）。 */
export const STARTING_MENTAL_LEVEL = 10;

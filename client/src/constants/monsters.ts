import type { Monster, LootDrop } from "@/types/monsters";

// ────────────────────────────────────────────────────────────────────────────
// 言語バリアント定義
// mult: HP/攻撃/防御/XP/ゴールドへの乗数。maxHit・speed・regen/dot は共通。
// xpFactor: 撃破時に付与する言語XP = Math.round(baseXp / 10 * xpFactor)
// ────────────────────────────────────────────────────────────────────────────

interface LangDef {
  id: string;
  name: string;
  mult: number;
  xpFactor: number;
}

export const MONSTER_LANG_DEFS: LangDef[] = [
  { id: "php",        name: "PHP",        mult: 0.90, xpFactor: 3 },
  { id: "ruby",       name: "Ruby",       mult: 0.95, xpFactor: 3 },
  { id: "javascript", name: "JavaScript", mult: 1.00, xpFactor: 4 },
  { id: "python",     name: "Python",     mult: 1.00, xpFactor: 4 },
  { id: "java",       name: "Java",       mult: 1.05, xpFactor: 4 },
  { id: "csharp",     name: "C#",         mult: 1.05, xpFactor: 4 },
  { id: "typescript", name: "TypeScript", mult: 1.10, xpFactor: 5 },
  { id: "kotlin",     name: "Kotlin",     mult: 1.10, xpFactor: 5 },
  { id: "go",         name: "Go",         mult: 1.15, xpFactor: 5 },
  { id: "rust",       name: "Rust",       mult: 1.30, xpFactor: 6 },
];

// ────────────────────────────────────────────────────────────────────────────
// 案件テンプレート（言語によらない基礎ステータス）
// ────────────────────────────────────────────────────────────────────────────

interface MonsterTemplate {
  id: string;
  name: string;
  hp: number;
  maxHit: number;
  attack: number;
  defence: number;
  speed: number;
  xp: number;
  goldMin: number;
  goldMax: number;
  loot: LootDrop[];
  dot?: number;
  regen?: number;
}

const TEMPLATES: MonsterTemplate[] = [
  {
    id: "bugfix",   name: "バグ修正",
    hp: 6, maxHit: 1, attack: 2, defence: 1, speed: 3000,
    xp: 12, goldMin: 500, goldMax: 1_500,
    loot: [{ item: "commit", chance: 0.5, min: 1, max: 2 }],
  },
  {
    id: "lp",       name: "LP制作",
    hp: 12, maxHit: 1, attack: 3, defence: 3, speed: 3200,
    xp: 22, goldMin: 10_000, goldMax: 25_000,
    loot: [{ item: "commit", chance: 0.5, min: 1, max: 2 }],
  },
  {
    id: "spec_change", name: "仕様変更",
    hp: 18, maxHit: 2, attack: 6, defence: 5, speed: 3000,
    xp: 30, goldMin: 8_000, goldMax: 20_000,
    regen: 1.2,
    loot: [{ item: "commit", chance: 0.4, min: 1, max: 2 }],
  },
  {
    id: "feature",  name: "機能開発",
    hp: 26, maxHit: 3, attack: 10, defence: 8, speed: 2800,
    xp: 46, goldMin: 15_000, goldMax: 40_000,
    loot: [{ item: "commit", chance: 0.5, min: 1, max: 2 }],
  },
  {
    id: "review",   name: "コードレビュー",
    hp: 22, maxHit: 3, attack: 9, defence: 13, speed: 2800,
    xp: 44, goldMin: 5_000, goldMax: 15_000,
    loot: [{ item: "commit", chance: 0.6, min: 1, max: 3 }],
  },
  {
    id: "webapp",   name: "Webアプリ受託",
    hp: 40, maxHit: 4, attack: 14, defence: 12, speed: 2700,
    xp: 80, goldMin: 30_000, goldMax: 80_000,
    loot: [{ item: "commit", chance: 0.6, min: 1, max: 3 }],
  },
  {
    id: "incident", name: "緊急障害対応",
    hp: 34, maxHit: 5, attack: 16, defence: 9, speed: 2400,
    xp: 72, goldMin: 10_000, goldMax: 30_000,
    dot: 1.5,
    loot: [{ item: "energy_drink", chance: 0.4, min: 1, max: 2 }],
  },
];

function langMonster(tmpl: MonsterTemplate, lang: LangDef): Monster {
  const m = lang.mult;
  const langXp = Math.round((tmpl.xp / 10) * lang.xpFactor);
  return {
    id: `${tmpl.id}_${lang.id}`,
    name: `${lang.name}の${tmpl.name}`,
    icon: lang.id,
    hp: Math.round(tmpl.hp * m),
    maxHit: tmpl.maxHit,
    attack: Math.round(tmpl.attack * m),
    defence: Math.round(tmpl.defence * m),
    speed: tmpl.speed,
    xp: Math.round(tmpl.xp * m),
    goldMin: Math.round(tmpl.goldMin * m),
    goldMax: Math.round(tmpl.goldMax * m),
    loot: tmpl.loot,
    ...(tmpl.regen !== undefined && { regen: tmpl.regen }),
    ...(tmpl.dot !== undefined && { dot: tmpl.dot }),
    weakTo: lang.id,
    xpAlso: { skill: lang.id, xp: langXp },
  };
}

// 言語 × 案件タイプの全組み合わせ (7テンプレ × 10言語 = 70体)
const LANG_MONSTERS: Monster[] = TEMPLATES.flatMap(tmpl =>
  MONSTER_LANG_DEFS.map(lang => langMonster(tmpl, lang))
);

// ────────────────────────────────────────────────────────────────────────────
// 言語固有の特殊案件（各言語の"あるある"問題）
// ────────────────────────────────────────────────────────────────────────────

const SPECIAL_MONSTERS: Monster[] = [
  {
    id: "ts_type_err",
    name: "TypeScript型エラー",
    icon: "typescript",
    hp: 28, maxHit: 3, attack: 10, defence: 16, speed: 2900,
    xp: 42, goldMin: 5_000, goldMax: 15_000,
    weakTo: "typescript",
    xpAlso: { skill: "typescript", xp: 15 },
    loot: [{ item: "commit", chance: 0.5, min: 1, max: 2 }],
  },
  {
    id: "py_memleak",
    name: "Pythonメモリリーク",
    icon: "python",
    hp: 38, maxHit: 4, attack: 12, defence: 8, speed: 2800,
    xp: 65, goldMin: 10_000, goldMax: 30_000,
    regen: 0.8,
    weakTo: "python",
    xpAlso: { skill: "python", xp: 20 },
    loot: [
      { item: "commit", chance: 0.5, min: 1, max: 3 },
      { item: "coffee", chance: 0.25, min: 1, max: 2 },
    ],
  },
  {
    id: "go_goroutine",
    name: "Goroutineリーク",
    icon: "go",
    hp: 45, maxHit: 4, attack: 14, defence: 20, speed: 3000,
    xp: 88, goldMin: 20_000, goldMax: 60_000,
    regen: 1.0,
    weakTo: "go",
    xpAlso: { skill: "go", xp: 25 },
    loot: [{ item: "commit", chance: 0.6, min: 2, max: 4 }],
  },
  {
    id: "rust_compile",
    name: "Rust所有権エラー",
    icon: "rust",
    hp: 30, maxHit: 4, attack: 15, defence: 35, speed: 2800,
    xp: 78, goldMin: 10_000, goldMax: 30_000,
    weakTo: "rust",
    xpAlso: { skill: "rust", xp: 22 },
    loot: [{ item: "commit", chance: 0.6, min: 1, max: 3 }],
  },
  {
    id: "sql_n1",
    name: "SQL N+1問題",
    icon: "sql",
    hp: 35, maxHit: 5, attack: 18, defence: 10, speed: 2400,
    xp: 82, goldMin: 15_000, goldMax: 40_000,
    regen: 1.2,
    weakTo: "sql",
    xpAlso: { skill: "sql", xp: 25 },
    loot: [
      { item: "commit", chance: 0.5, min: 2, max: 3 },
      { item: "coffee", chance: 0.3, min: 1, max: 2 },
    ],
  },
  {
    id: "enjou",
    name: "炎上案件",
    icon: "enjou",
    hp: 65, maxHit: 8, attack: 28, defence: 18, speed: 2000,
    xp: 140, goldMin: 80_000, goldMax: 250_000,
    dot: 3.0,
    loot: [
      { item: "commit", chance: 0.7, min: 3, max: 6 },
      { item: "energy_drink", chance: 0.5, min: 2, max: 3 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// 上位案件（言語によらない大型案件）
// ────────────────────────────────────────────────────────────────────────────

const UPPER_MONSTERS: Monster[] = [
  {
    id: "techdebt",
    name: "技術的負債解消",
    icon: "techdebt_m",
    hp: 45, maxHit: 4, attack: 14, defence: 22, speed: 3000,
    xp: 90, goldMin: 30_000, goldMax: 80_000,
    dot: 1.0,
    loot: [
      { item: "commit", chance: 0.5, min: 1, max: 3 },
      { item: "coffee", chance: 0.3, min: 1, max: 2 },
    ],
  },
  {
    id: "newproject",
    name: "新規PJT立ち上げ",
    icon: "newproject_m",
    hp: 58, maxHit: 5, attack: 18, defence: 14, speed: 2600,
    xp: 110, goldMin: 50_000, goldMax: 150_000,
    regen: 0.65,
    loot: [
      { item: "commit", chance: 0.6, min: 2, max: 4 },
      { item: "coffee", chance: 0.4, min: 1, max: 2 },
    ],
  },
  {
    id: "perf_issue",
    name: "パフォーマンス障害",
    icon: "perf_m",
    hp: 50, maxHit: 6, attack: 22, defence: 12, speed: 2200,
    xp: 130, goldMin: 40_000, goldMax: 120_000,
    regen: 1.5,
    loot: [
      { item: "commit", chance: 0.5, min: 2, max: 4 },
      { item: "energy_drink", chance: 0.3, min: 1, max: 2 },
    ],
  },
  {
    id: "migration",
    name: "システム移行",
    icon: "migration_m",
    hp: 80, maxHit: 6, attack: 20, defence: 18, speed: 3400,
    xp: 160, goldMin: 80_000, goldMax: 250_000,
    regen: 2.0,
    loot: [
      { item: "commit", chance: 0.7, min: 3, max: 6 },
      { item: "coffee", chance: 0.5, min: 1, max: 3 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// 全モンスターリスト
// ────────────────────────────────────────────────────────────────────────────
export const MONSTERS: Monster[] = [
  ...LANG_MONSTERS,    // 言語 × 案件タイプ (70体)
  ...SPECIAL_MONSTERS, // 言語固有の特殊案件 (6体)
  ...UPPER_MONSTERS,   // 上位案件 (4体)
];

import type { Modifier } from "../modifiers";

// 起業(プレステージ)で貯まる「ストック」で買う永続強化。リセットしても残る。
export interface PrestigeUpgrade {
  id: string;
  name: string;
  icon: string;
  desc: string;
  maxLevel: number;
  /** lvl目(1始まり)を買う費用(ストック)。 */
  cost: (nextLevel: number) => number;
  /** 取得レベルに応じた補正。 */
  modifiers: (level: number) => Modifier[];
}

export const PRESTIGE_UPGRADES: PrestigeUpgrade[] = [
  {
    id: "funding",
    name: "資金調達",
    icon: "funding",
    desc: "給料 +12% / Lv",
    maxLevel: 5,
    cost: (n) => n * 4,
    modifiers: (lv) => [{ key: "gold", pct: 12 * lv }],
  },
  {
    id: "automation",
    name: "自動化",
    icon: "automation",
    desc: "生産速度 +10% / Lv",
    maxLevel: 5,
    cost: (n) => n * 5,
    modifiers: (lv) => [{ key: "speed.gather", pct: 10 * lv }],
  },
  {
    id: "tech",
    name: "技術力",
    icon: "tech",
    desc: "制作速度 +8% ・制作XP +6% / Lv",
    maxLevel: 5,
    cost: (n) => n * 5,
    modifiers: (lv) => [
      { key: "speed.craft", pct: 8 * lv },
      { key: "xp.craft", pct: 6 * lv },
    ],
  },
  {
    id: "brand",
    name: "ブランド力",
    icon: "brand",
    desc: "ドロップ率 +15% / Lv",
    maxLevel: 5,
    cost: (n) => n * 4,
    modifiers: (lv) => [{ key: "dropRate", pct: 15 * lv }],
  },
  {
    id: "wellness",
    name: "メンタルケア",
    icon: "wellness",
    desc: "メンタル上限 +10% / Lv",
    maxLevel: 5,
    cost: (n) => n * 4,
    modifiers: (lv) => [{ key: "power.maxHp", pct: 10 * lv }],
  },
  {
    id: "delivery",
    name: "開発力",
    icon: "delivery",
    desc: "実装力 +8% ・精度 +8% / Lv",
    maxLevel: 5,
    cost: (n) => n * 5,
    modifiers: (lv) => [
      { key: "power.maxHit", pct: 8 * lv },
      { key: "power.accuracy", pct: 8 * lv },
    ],
  },
];

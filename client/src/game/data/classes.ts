import type { Modifier } from "../modifiers";

export interface JobClass {
  id: string;
  name: string;
  icon: string;
  /** 解禁に必要な役職ランクindex（rank.ts の RANKS）。2=ミドル, 4=テックリード。 */
  requiresRank: number;
  modifiers: Modifier[];
  passive?: string; // 文章での補足（効果は将来実装 or modifierで近似）
  /** 上位職: この職種から昇格できる。 */
  upgradesFrom?: string[];
}

// 職種クラス。ミドル(rank2)で選択解禁。各職種が乗算補正＋個性。転職可。
export const CLASSES: JobClass[] = [
  {
    id: "none",
    name: "無所属",
    icon: "none",
    requiresRank: 0,
    modifiers: [],
    passive: "補正なし。ミドル昇進で職種を選べる。",
  },

  // --- 基本職 (rank2 / ミドル) ---
  {
    id: "frontend",
    name: "フロントエンド",
    icon: "frontend",
    requiresRank: 2,
    modifiers: [
      { key: "speed.craft", pct: 20, note: "UI実装が速い" },
      { key: "dropRate", pct: 15, note: "顧客ウケ" },
      { key: "speed.combat", pct: -8 },
    ],
    passive: "ドロップ率↑。制作が速い。",
  },
  {
    id: "backend",
    name: "バックエンド",
    icon: "backend",
    requiresRank: 2,
    modifiers: [
      { key: "power.maxHit", pct: 25, note: "ロジック火力" },
      { key: "power.defence", pct: 10 },
      { key: "speed.gather", pct: -10 },
    ],
    passive: "実装力↑・堅牢↑。生産はやや遅い。",
  },
  {
    id: "sre",
    name: "インフラ / SRE",
    icon: "sre",
    requiresRank: 2,
    modifiers: [
      { key: "speed.craft", pct: 35, note: "環境構築が得意" },
      { key: "power.maxHp", pct: 15, note: "障害耐性" },
      { key: "power.maxHit", pct: -10 },
    ],
    passive: "制作大幅↑・メンタル上限↑。",
  },
  {
    id: "data",
    name: "データサイエンティスト",
    icon: "data",
    requiresRank: 2,
    modifiers: [
      { key: "dropRate", pct: 35, note: "分析で良い素材を引く" },
      { key: "xp.gather", pct: 15 },
    ],
    passive: "ドロップ率大幅↑。",
  },
  {
    id: "qa",
    name: "QA",
    icon: "qa",
    requiresRank: 2,
    modifiers: [
      { key: "power.defence", pct: 40, note: "品質で受け流す" },
      { key: "xp.combat", pct: 10 },
    ],
    passive: "堅牢性大幅↑。",
  },
  {
    id: "pm",
    name: "PM",
    icon: "pm",
    requiresRank: 2,
    modifiers: [
      { key: "xp.gather", pct: 10 },
      { key: "xp.craft", pct: 10 },
      { key: "xp.combat", pct: 10 },
      { key: "gold", pct: 15 },
      { key: "subEfficiency", pct: 30 },
    ],
    passive: "全XP＋給料↑。部下効率+30%。尖りはないが万能。",
  },

  // --- 上位職 (rank4 / テックリード) ---
  {
    id: "fullstack",
    name: "フルスタック",
    icon: "fullstack",
    requiresRank: 4,
    upgradesFrom: ["frontend", "backend"],
    modifiers: [
      { key: "speed.gather", pct: 15 },
      { key: "speed.craft", pct: 15 },
      { key: "power.maxHit", pct: 15 },
      { key: "xp.combat", pct: 10 },
    ],
    passive: "全方位に穴がない。並行案件スロット+1(将来)。",
  },
  {
    id: "security",
    name: "セキュリティ",
    icon: "security",
    requiresRank: 4,
    upgradesFrom: ["backend", "sre"],
    modifiers: [
      { key: "power.defence", pct: 50 },
      { key: "power.maxHp", pct: 20 },
      { key: "gold", pct: 10 },
    ],
    passive: "圧倒的防御。炎上を確率無効(将来)。",
  },
];

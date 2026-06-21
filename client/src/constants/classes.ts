import type { Modifier } from "@/types/effects";

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

  // --- 見習い職 (rank1 / ジュニア) ---
  {
    id: "tester",
    name: "テスター",
    icon: "tester",
    requiresRank: 1,
    modifiers: [
      { key: "power.defence", pct: 15, note: "不具合に慣れている" },
      { key: "xp.combat", pct: 10, note: "バグ発見で経験値" },
      { key: "dropRate", pct: 8, note: "細かいところに気づく" },
    ],
    passive: "防御↑・戦闘XP↑。ミドル昇進でQAへ転職できる。",
  },
  {
    id: "excel_ppt",
    name: "エクセルパワポ職人",
    icon: "excel_ppt",
    requiresRank: 1,
    modifiers: [
      { key: "speed.craft", pct: 90, note: "資料作成が爆速" },
      { key: "gold", pct: 15, note: "ビジネス価値が高い" },
      { key: "power.maxHit", pct: -90, note: "コーディングは壊滅的" },
    ],
    passive: "制作速度が圧倒的↑・収入↑。コーディング力は壊滅的。ミドル昇進でPMへ転職できる。",
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
      { key: "speed.craft", pct: 35, note: "制作が得意" },
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
    upgradesFrom: ["tester"],
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
    upgradesFrom: ["excel_ppt"],
    modifiers: [
      { key: "xp.gather", pct: 12 },
      { key: "xp.craft", pct: 12 },
      { key: "xp.combat", pct: 12 },
      { key: "gold", pct: 20 },
    ],
    passive: "全XP＋給料↑。尖りはないが万能。",
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
  {
    id: "ml_eng",
    name: "MLエンジニア",
    icon: "ml_eng",
    requiresRank: 4,
    upgradesFrom: ["data"],
    modifiers: [
      { key: "xp.gather", pct: 20, note: "学習効率" },
      { key: "dropRate", pct: 25, note: "特徴量の質" },
      { key: "power.maxHp", pct: -5, note: "GPU代でメンタル削れる" },
    ],
    passive: "データ収集・学習速度↑。ドロップ率大幅↑。",
  },
  {
    id: "devrel",
    name: "DevRelエンジニア",
    icon: "devrel",
    requiresRank: 4,
    upgradesFrom: ["pm", "frontend"],
    modifiers: [
      { key: "gold", pct: 30, note: "登壇・OSS貢献で収益" },
      { key: "xp.gather", pct: 15, note: "アウトプットで学習" },
      { key: "xp.craft", pct: 10, note: "OSS実装" },
      { key: "power.maxHit", pct: -5 },
    ],
    passive: "収入大幅↑。アウトプット駆動で全XP↑。",
  },
  {
    id: "platform_eng",
    name: "プラットフォームエンジニア",
    icon: "platform_eng",
    requiresRank: 4,
    upgradesFrom: ["sre"],
    modifiers: [
      { key: "speed.craft", pct: 50, note: "自動化で制作激速" },
      { key: "speed.combat", pct: 10, note: "インフラが足を引っ張らない" },
      { key: "power.maxHit", pct: -15, note: "実装力は弱め" },
    ],
    passive: "制作速度が圧倒的。戦闘速度↑。実装火力は低め。",
  },

  // --- 上位職 (rank5 / 役員) ---
  {
    id: "cto",
    name: "CTO",
    icon: "cto",
    requiresRank: 5,
    upgradesFrom: ["fullstack", "ml_eng"],
    modifiers: [
      { key: "xp.gather", pct: 15, note: "技術の幅" },
      { key: "xp.craft", pct: 15, note: "実装品質" },
      { key: "xp.combat", pct: 15, note: "現場力" },
      { key: "gold", pct: 25, note: "給与・株" },
      { key: "power.maxHit", pct: 10, note: "技術判断力" },
    ],
    passive: "全XP・収入・火力が均等に上がる万能上位職。",
  },
  {
    id: "vp_eng",
    name: "VPoE",
    icon: "vp_eng",
    requiresRank: 5,
    upgradesFrom: ["security", "platform_eng"],
    modifiers: [
      { key: "power.defence", pct: 60, note: "組織防衛" },
      { key: "power.maxHp", pct: 30, note: "メンタル強靭" },
      { key: "gold", pct: 15, note: "年収" },
      { key: "speed.gather", pct: -10, note: "コーディングからは離れる" },
    ],
    passive: "防御・HP圧倒的。炎上・移行案件に強い。コーディング速度は落ちる。",
  },
];

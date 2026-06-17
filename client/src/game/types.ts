// ---- Shared game data types (data-driven configs reference these) ----

export type ItemId = string;
export type SkillId = string;
export type ActionId = string;
export type MonsterId = string;

export type ItemType = "resource" | "product" | "weapon" | "food" | "misc";

export type EquipSlot = "weapon" | "body" | "bag" | "hair" | "avatar" | "pc";

export interface WeaponStats {
  /** Added to attack rating (accuracy). */
  attackBonus: number;
  /** Added to max hit (damage). */
  strengthBonus: number;
  /** Attack interval in ms (lower = faster). */
  speed: number;
}

/** 装備の定義。weapon スロットは戦闘ステ、その他は永続補正(modifiers)。 */
export interface EquipDef {
  slot: EquipSlot;
  weapon?: WeaponStats;
  modifiers?: import("./modifiers").Modifier[];
}

export interface Item {
  id: ItemId;
  name: string;
  type: ItemType;
  icon?: string;
  /** Base value when selling to the shop (gold). */
  sellPrice: number;
  /** Food only: hit points restored when eaten. */
  heals?: number;
  /** Equippable gear. */
  equip?: EquipDef;
}

export type SkillKind = "gather" | "craft" | "combat";

/** サイドバーの大分類。
 *  language=言語(どう書く) / platform=領域・プラットフォーム(何を作る) /
 *  infra=インフラ・基盤(どこで動かす) / domain=業界ドメイン(誰のために) /
 *  craft=クラフト / combat=現場力。 */
export type SkillCategory =
  | "language" | "platform" | "infra" | "domain" | "craft" | "combat";

export interface Skill {
  id: SkillId;
  name: string;
  /** gather=生産系, craft=制作系, combat=現場力(戦闘ステ)。エンジンの速度/XP補正に使用。 */
  kind: SkillKind;
  icon: string;
  /** サイドバーの大分類。 */
  category: SkillCategory;
  /** 技術の種別（言語スキル内の表示用）。 */
  tech?: "language" | "framework";
}

/** アクションの種別（言語スキル内の表示グループ）。 */
export type ActionCategory =
  | "base"
  | "concept"
  | "library"
  | "framework"
  | "oss"
  | "cert";

/** A repeatable training action: gather a resource or craft an item. */
export interface GameAction {
  id: ActionId;
  skill: SkillId;
  name: string;
  /** 言語スキル内での表示分類。 */
  category?: ActionCategory;
  /** アクション固有アイコン（未指定なら category から決定）。 */
  icon?: string;
  /** Skill level required to perform this action. */
  level: number;
  /** Time per completion in ms. */
  time: number;
  /** XP granted to `skill` per completion. */
  xp: number;
  /** 副次的に経験値が入るスキル。完了ごとに `skill`(主)に加えてこちらにも入る。
   *  例: フレームワーク実装は言語(主)＋ドメイン(副)。概念は分離・獲得は同時。 */
  xpAlso?: { skill: SkillId; xp: number };
  /** Items consumed per completion (craft actions). */
  inputs?: Partial<Record<ItemId, number>>;
  /** Items produced per completion. */
  outputs: Partial<Record<ItemId, number>>;
}

export interface LootDrop {
  item: ItemId;
  /** Drop chance 0..1. */
  chance: number;
  min: number;
  max: number;
}

export interface Monster {
  id: MonsterId;
  name: string;
  icon: string;
  hp: number;
  /** Max damage the monster can deal per hit. */
  maxHit: number;
  /** Monster accuracy rating. */
  attack: number;
  /** Monster defence rating (resists player accuracy). */
  defence: number;
  /** Attack interval in ms. */
  speed: number;
  /** Combat XP pool granted on kill (split across attack/strength/defence). */
  xp: number;
  goldMin: number;
  goldMax: number;
  loot: LootDrop[];
  /** メンタルへの継続ダメージ (毎秒)。本番障害など。 */
  dot?: number;
  /** 自己回復 (HP毎秒)。仕様変更など「倒しきれない」案件。 */
  regen?: number;
}

// ---- Runtime save state ----

export type ActiveAction =
  | { kind: "skill"; actionId: ActionId }
  | { kind: "combat"; monsterId: MonsterId }
  | null;

/** 農業の畑1区画。作物を植えると growth(ms) が経過時間で増え、growMs で収穫可。
 *  作物の成長は放置で進む（能動アクションとは独立）。手入れ中は成長が加速する。 */
export interface PlotState {
  crop: ItemId | null;
  growth: number;
}

export interface SaveState {
  version: number;
  skills: Record<SkillId, { xp: number }>;
  bank: Record<ItemId, number>;
  /** 農業の畑（放置で育つ）。 */
  plots: PlotState[];
  gold: number;
  /** 選択中の職種クラス id（null = 無所属）。補正の源。 */
  jobClass: string | null;
  /** 起業(プレステージ)で得る永続通貨「ストック」。 */
  prestigePoints: number;
  /** 永続アップグレード id → 取得レベル。 */
  prestigeUpgrades: Record<string, number>;
  /** 起業した回数。 */
  prestigeCount: number;
  /** 達成済みマイルストーン id（キャリア・ロードマップ）。 */
  milestones: string[];
  /** スロット → 装備中アイテム id。 */
  equipment: Partial<Record<EquipSlot, ItemId>>;
  selectedFood: ItemId | null;
  playerHp: number;
  active: ActiveAction;
  /** Carry-over progress on the current skill action (ms). */
  actionProgress: number;
  lastSaved: number;
}

export interface OfflineSummary {
  ms: number;
  xp: Record<SkillId, number>;
  items: Record<ItemId, number>;
  gold: number;
}

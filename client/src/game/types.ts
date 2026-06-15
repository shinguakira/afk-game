// ---- Shared game data types (data-driven configs reference these) ----

export type ItemId = string;
export type SkillId = string;
export type ActionId = string;
export type MonsterId = string;

export type ItemType = "resource" | "bar" | "weapon" | "food" | "misc";

export type DomainId = string;

/** 技術分野（Web / ゲーム / 組み込み / AI…）。スキルをまとめる軸。 */
export interface Domain {
  id: DomainId;
  name: string;
  icon: string;
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
  /** Weapon only: combat bonuses. */
  weapon?: WeaponStats;
}

export interface WeaponStats {
  /** Added to attack rating (accuracy). */
  attackBonus: number;
  /** Added to max hit (damage). */
  strengthBonus: number;
  /** Attack interval in ms (lower = faster). */
  speed: number;
}

export type SkillKind = "gather" | "craft" | "combat";

export interface Skill {
  id: SkillId;
  name: string;
  /** gather=言語, craft=フレームワーク, combat=現場力(戦闘ステ)。 */
  kind: SkillKind;
  icon: string;
  /** サイドバーの所属グループ id（groups.ts）。combat ステは無し。 */
  group?: string;
  /** 技術の種別（表示・グルーピング用）。 */
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
  /** Items consumed per completion (craft actions). */
  inputs?: Partial<Record<ItemId, number>>;
  /** Items produced per completion. */
  outputs: Partial<Record<ItemId, number>>;
  /** 追加の前提条件: 別スキル(言語)の最低レベル。フレームワークが言語に依存する等。 */
  requires?: { skill: SkillId; level: number };
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
  /** 案件の技術分野（任意）。 */
  domain?: DomainId;
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

/** 部下。プレイヤーとは別に生産/制作アクションを1つ並行で回せる。 */
export interface Subordinate {
  id: string;
  name: string;
  /** 自身の経験値（levelForXp で熟練度に変換）。 */
  xp: number;
  /** 割り当て中のアクション id（生産/制作のみ）。null = 待機。 */
  assignment: ActionId | null;
  /** 進捗(ms)。 */
  progress: number;
}

// ---- Runtime save state ----

export type ActiveAction =
  | { kind: "skill"; actionId: ActionId }
  | { kind: "combat"; monsterId: MonsterId }
  | null;

export interface SaveState {
  version: number;
  skills: Record<SkillId, { xp: number }>;
  bank: Record<ItemId, number>;
  gold: number;
  /** 選択中の職種クラス id（null = 無所属）。補正の源。 */
  jobClass: string | null;
  /** 部下。生産/制作を並行で回す。 */
  subordinates: Subordinate[];
  /** 起業(プレステージ)で得る永続通貨「ストック」。 */
  prestigePoints: number;
  /** 永続アップグレード id → 取得レベル。 */
  prestigeUpgrades: Record<string, number>;
  /** 起業した回数。 */
  prestigeCount: number;
  equippedWeapon: ItemId | null;
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

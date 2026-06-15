// ---- Shared game data types (data-driven configs reference these) ----

export type ItemId = string;
export type SkillId = string;
export type ActionId = string;
export type MonsterId = string;

export type ItemType = "resource" | "bar" | "weapon" | "food" | "misc";

export interface Item {
  id: ItemId;
  name: string;
  type: ItemType;
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
  kind: SkillKind;
  icon: string;
}

/** A repeatable training action: gather a resource or craft an item. */
export interface GameAction {
  id: ActionId;
  skill: SkillId;
  name: string;
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

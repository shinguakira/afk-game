import type { Modifier } from "@/types/effects";

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
  modifiers?: Modifier[];
}

export interface Item {
  id: string;
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

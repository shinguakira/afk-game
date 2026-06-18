import type { ItemId, MonsterId } from "./ids";

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

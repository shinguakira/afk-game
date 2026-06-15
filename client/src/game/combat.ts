import type { Monster, SaveState } from "./types";
import { ITEM_MAP } from "./data";
import { levelForXp } from "./xp";

export interface CombatStats {
  attackLevel: number;
  strengthLevel: number;
  defenceLevel: number;
  hitpointsLevel: number;
  maxHp: number;
  maxHit: number;
  attackRating: number;
  defenceRating: number;
  weaponSpeed: number;
}

/** Derive the player's effective combat stats from skills + equipped weapon. */
export function getCombatStats(state: SaveState): CombatStats {
  const attackLevel = levelForXp(state.skills.attack?.xp ?? 0);
  const strengthLevel = levelForXp(state.skills.strength?.xp ?? 0);
  const defenceLevel = levelForXp(state.skills.defence?.xp ?? 0);
  const hitpointsLevel = levelForXp(state.skills.hitpoints?.xp ?? 0);

  const weapon = state.equippedWeapon
    ? ITEM_MAP[state.equippedWeapon]?.weapon
    : undefined;

  const maxHit = Math.floor(
    1 + strengthLevel * 0.4 + (weapon?.strengthBonus ?? 0),
  );
  const attackRating = 2 + attackLevel * 2 + (weapon?.attackBonus ?? 0);
  const defenceRating = 5 + defenceLevel * 2;
  const weaponSpeed = weapon?.speed ?? 3000; // bare fists: slow

  return {
    attackLevel,
    strengthLevel,
    defenceLevel,
    hitpointsLevel,
    maxHp: hitpointsLevel * 10,
    maxHit,
    attackRating,
    defenceRating,
    weaponSpeed,
  };
}

/** Chance (0..1) the player lands a hit on the monster. */
export function playerHitChance(stats: CombatStats, monster: Monster): number {
  return stats.attackRating / (stats.attackRating + monster.defence);
}

/** Chance (0..1) the monster lands a hit on the player. */
export function enemyHitChance(stats: CombatStats, monster: Monster): number {
  return monster.attack / (monster.attack + stats.defenceRating);
}

/** Average damage per player swing (for offline estimation). */
export function avgPlayerDamage(stats: CombatStats, monster: Monster): number {
  // uniform 1..maxHit on hit
  const hitAvg = (1 + stats.maxHit) / 2;
  return playerHitChance(stats, monster) * hitAvg;
}

/** Average damage per monster swing (for offline estimation). */
export function avgEnemyDamage(stats: CombatStats, monster: Monster): number {
  const hitAvg = (1 + monster.maxHit) / 2;
  return enemyHitChance(stats, monster) * hitAvg;
}

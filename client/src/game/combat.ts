import type { Monster, SaveState } from "./types";
import { ITEM_MAP, STAT } from "./data";
import { levelForXp } from "./xp";
import { getEffects } from "./effects";
import { mult } from "./modifiers";

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
  const attackLevel = levelForXp(state.skills[STAT.accuracy]?.xp ?? 0);
  const strengthLevel = levelForXp(state.skills[STAT.damage]?.xp ?? 0);
  const defenceLevel = levelForXp(state.skills[STAT.defence]?.xp ?? 0);
  const hitpointsLevel = levelForXp(state.skills[STAT.mental]?.xp ?? 0);

  const weapon = state.equippedWeapon
    ? ITEM_MAP[state.equippedWeapon]?.weapon
    : undefined;

  // Job-class (and future) modifiers.
  const eff = getEffects(state);

  const maxHit = Math.floor(
    (1 + strengthLevel * 0.4 + (weapon?.strengthBonus ?? 0)) *
      mult(eff, "power.maxHit"),
  );
  const attackRating = Math.round(
    (2 + attackLevel * 2 + (weapon?.attackBonus ?? 0)) *
      mult(eff, "power.accuracy"),
  );
  const defenceRating = Math.round((5 + defenceLevel * 2) * mult(eff, "power.defence"));
  // 速度補正は大きいほど速い → 攻撃間隔を割る。
  const weaponSpeed = Math.round((weapon?.speed ?? 3000) / mult(eff, "speed.combat"));

  return {
    attackLevel,
    strengthLevel,
    defenceLevel,
    hitpointsLevel,
    maxHp: Math.floor(hitpointsLevel * 10 * mult(eff, "power.maxHp")),
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

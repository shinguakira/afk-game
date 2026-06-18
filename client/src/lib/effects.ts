import type { SaveState } from "../types/save";
import { CLASS_MAP, ITEM_MAP, PRESTIGE_MAP } from "../constants/maps";
import { resolveModifiers } from "./modifiers";
import type { Effects, Modifier } from "../types/effects";

/**
 * Collect every active Modifier affecting the player:
 * job class + permanent prestige upgrades. (Later: 資格 / 施設 push here too.)
 */
function activeModifiers(state: SaveState): Modifier[] {
  const mods: Modifier[] = [];
  if (state.jobClass) {
    const cls = CLASS_MAP[state.jobClass];
    if (cls) mods.push(...cls.modifiers);
  }
  for (const [id, level] of Object.entries(state.prestigeUpgrades ?? {})) {
    const up = PRESTIGE_MAP[id];
    if (up && level > 0) mods.push(...up.modifiers(level));
  }
  // 装備の補正（服/髪/アイコン/PC、武器の付加効果）。
  for (const itemId of Object.values(state.equipment ?? {})) {
    const eq = itemId ? ITEM_MAP[itemId]?.equip : undefined;
    if (eq?.modifiers) mods.push(...eq.modifiers);
  }
  return mods;
}

export function getEffects(state: SaveState): Effects {
  return resolveModifiers(activeModifiers(state));
}

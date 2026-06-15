import type { SaveState } from "./types";
import { CLASS_MAP, PRESTIGE_MAP } from "./data";
import { type Effects, type Modifier, resolveModifiers } from "./modifiers";

/**
 * Collect every active Modifier affecting the player:
 * job class + permanent prestige upgrades. (Later: 資格 / 施設 push here too.)
 */
export function activeModifiers(state: SaveState): Modifier[] {
  const mods: Modifier[] = [];
  if (state.jobClass) {
    const cls = CLASS_MAP[state.jobClass];
    if (cls) mods.push(...cls.modifiers);
  }
  for (const [id, level] of Object.entries(state.prestigeUpgrades ?? {})) {
    const up = PRESTIGE_MAP[id];
    if (up && level > 0) mods.push(...up.modifiers(level));
  }
  return mods;
}

export function getEffects(state: SaveState): Effects {
  return resolveModifiers(activeModifiers(state));
}

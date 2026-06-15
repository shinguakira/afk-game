import type { SaveState } from "./types";
import { CLASS_MAP } from "./data";
import { type Effects, type Modifier, resolveModifiers } from "./modifiers";

/**
 * Collect every active Modifier affecting the player.
 * For now: current job class. Later: 資格 / 施設 / 転生 tree all push here.
 */
export function activeModifiers(state: SaveState): Modifier[] {
  const mods: Modifier[] = [];
  if (state.jobClass) {
    const cls = CLASS_MAP[state.jobClass];
    if (cls) mods.push(...cls.modifiers);
  }
  return mods;
}

export function getEffects(state: SaveState): Effects {
  return resolveModifiers(activeModifiers(state));
}

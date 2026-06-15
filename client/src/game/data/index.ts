import type { GameAction, Item, Monster, Skill } from "../types";
import type { JobClass } from "./classes";
import { ITEMS } from "./items";
import { SKILLS } from "./skills";
import { ACTIONS } from "./actions";
import { MONSTERS } from "./monsters";
import { CLASSES } from "./classes";

export { ITEMS, SKILLS, ACTIONS, MONSTERS, CLASSES };
export { STAT, COMBAT_STAT_IDS, STARTING_MENTAL_LEVEL } from "./skills";
export type { JobClass } from "./classes";

export const CLASS_MAP: Record<string, JobClass> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c]),
);

// Lookup maps for O(1) access by id.
export const ITEM_MAP: Record<string, Item> = Object.fromEntries(
  ITEMS.map((i) => [i.id, i]),
);
export const SKILL_MAP: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);
export const ACTION_MAP: Record<string, GameAction> = Object.fromEntries(
  ACTIONS.map((a) => [a.id, a]),
);
export const MONSTER_MAP: Record<string, Monster> = Object.fromEntries(
  MONSTERS.map((m) => [m.id, m]),
);

export const ACTIONS_BY_SKILL: Record<string, GameAction[]> = ACTIONS.reduce(
  (acc, a) => {
    (acc[a.skill] ??= []).push(a);
    return acc;
  },
  {} as Record<string, GameAction[]>,
);

export function item(id: string): Item {
  const it = ITEM_MAP[id];
  if (!it) throw new Error(`Unknown item id: ${id}`);
  return it;
}

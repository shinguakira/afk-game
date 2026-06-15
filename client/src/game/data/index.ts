import type { Domain, GameAction, Item, Monster, Skill } from "../types";
import type { JobClass } from "./classes";
import { ITEMS } from "./items";
import { SKILLS } from "./skills";
import { ACTIONS } from "./actions";
import { MONSTERS } from "./monsters";
import { CLASSES } from "./classes";
import { DOMAINS } from "./domains";
import { GROUPS } from "./groups";
import type { SkillGroup } from "./groups";
import { PRESTIGE_UPGRADES } from "./prestige";
import type { PrestigeUpgrade } from "./prestige";

export { ITEMS, SKILLS, ACTIONS, MONSTERS, CLASSES, DOMAINS, GROUPS, PRESTIGE_UPGRADES };
export type { SkillGroup } from "./groups";
export { STAT, COMBAT_STAT_IDS, STARTING_MENTAL_LEVEL } from "./skills";
export type { JobClass } from "./classes";
export type { PrestigeUpgrade } from "./prestige";

export const CLASS_MAP: Record<string, JobClass> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c]),
);

export const PRESTIGE_MAP: Record<string, PrestigeUpgrade> = Object.fromEntries(
  PRESTIGE_UPGRADES.map((p) => [p.id, p]),
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

export const DOMAIN_MAP: Record<string, Domain> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d]),
);

export const GROUP_MAP: Record<string, SkillGroup> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g]),
);

/** グループ id → スキル一覧（サイドバーの折りたたみ用）。 */
export const SKILLS_BY_GROUP: Record<string, Skill[]> = (() => {
  const acc: Record<string, Skill[]> = {};
  for (const g of GROUPS) acc[g.id] = [];
  for (const s of SKILLS) {
    if (s.group && acc[s.group]) acc[s.group].push(s);
  }
  return acc;
})();

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

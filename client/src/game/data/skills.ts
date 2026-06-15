import type { Skill } from "../types";

export const SKILLS: Skill[] = [
  // Gathering
  { id: "mining", name: "Mining", kind: "gather", icon: "⛏️" },
  { id: "woodcutting", name: "Woodcutting", kind: "gather", icon: "🪓" },
  // Crafting
  { id: "smithing", name: "Smithing", kind: "craft", icon: "🔨" },
  // Combat (trained by fighting monsters)
  { id: "attack", name: "Attack", kind: "combat", icon: "⚔️" },
  { id: "strength", name: "Strength", kind: "combat", icon: "💪" },
  { id: "defence", name: "Defence", kind: "combat", icon: "🛡️" },
  { id: "hitpoints", name: "Hitpoints", kind: "combat", icon: "❤️" },
];

/** Hitpoints starts at level 10 (like RuneScape) so the player isn't 1-shot. */
export const STARTING_HITPOINTS_XP_LEVEL = 10;

import type { GameAction } from "../types";

// Gather + craft actions. Combat is handled separately (see monsters.ts).
export const ACTIONS: GameAction[] = [
  // --- Mining ---
  {
    id: "mine_copper",
    skill: "mining",
    name: "Mine Copper",
    level: 1,
    time: 3000,
    xp: 17,
    outputs: { copper_ore: 1 },
  },
  {
    id: "mine_tin",
    skill: "mining",
    name: "Mine Tin",
    level: 1,
    time: 3000,
    xp: 17,
    outputs: { tin_ore: 1 },
  },
  {
    id: "mine_coal",
    skill: "mining",
    name: "Mine Coal",
    level: 10,
    time: 3500,
    xp: 25,
    outputs: { coal: 1 },
  },
  {
    id: "mine_iron",
    skill: "mining",
    name: "Mine Iron",
    level: 15,
    time: 4000,
    xp: 35,
    outputs: { iron_ore: 1 },
  },

  // --- Woodcutting ---
  {
    id: "cut_normal",
    skill: "woodcutting",
    name: "Cut Tree",
    level: 1,
    time: 3000,
    xp: 10,
    outputs: { normal_logs: 1 },
  },
  {
    id: "cut_oak",
    skill: "woodcutting",
    name: "Cut Oak",
    level: 15,
    time: 4000,
    xp: 15,
    outputs: { oak_logs: 1 },
  },

  // --- Smithing: smelt ore -> bars ---
  {
    id: "smelt_bronze",
    skill: "smithing",
    name: "Smelt Bronze Bar",
    level: 1,
    time: 2400,
    xp: 12,
    inputs: { copper_ore: 1, tin_ore: 1 },
    outputs: { bronze_bar: 1 },
  },
  {
    id: "smelt_iron",
    skill: "smithing",
    name: "Smelt Iron Bar",
    level: 15,
    time: 2800,
    xp: 20,
    inputs: { iron_ore: 1, coal: 1 },
    outputs: { iron_bar: 1 },
  },

  // --- Smithing: bars -> weapons ---
  {
    id: "smith_bronze_sword",
    skill: "smithing",
    name: "Smith Bronze Sword",
    level: 4,
    time: 3200,
    xp: 28,
    inputs: { bronze_bar: 2 },
    outputs: { bronze_sword: 1 },
  },
  {
    id: "smith_iron_sword",
    skill: "smithing",
    name: "Smith Iron Sword",
    level: 19,
    time: 3600,
    xp: 50,
    inputs: { iron_bar: 2 },
    outputs: { iron_sword: 1 },
  },
];

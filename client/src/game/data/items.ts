import type { Item } from "../types";

// Add an item here and it becomes bankable / sellable / usable everywhere.
export const ITEMS: Item[] = [
  // --- Ores & raw resources ---
  { id: "copper_ore", name: "Copper Ore", type: "resource", sellPrice: 2 },
  { id: "tin_ore", name: "Tin Ore", type: "resource", sellPrice: 2 },
  { id: "iron_ore", name: "Iron Ore", type: "resource", sellPrice: 5 },
  { id: "coal", name: "Coal", type: "resource", sellPrice: 6 },

  // --- Logs ---
  { id: "normal_logs", name: "Logs", type: "resource", sellPrice: 2 },
  { id: "oak_logs", name: "Oak Logs", type: "resource", sellPrice: 5 },

  // --- Bars (smelted) ---
  { id: "bronze_bar", name: "Bronze Bar", type: "bar", sellPrice: 8 },
  { id: "iron_bar", name: "Iron Bar", type: "bar", sellPrice: 18 },

  // --- Weapons (smithed, equippable) ---
  {
    id: "bronze_sword",
    name: "Bronze Sword",
    type: "weapon",
    sellPrice: 25,
    weapon: { attackBonus: 6, strengthBonus: 5, speed: 2600 },
  },
  {
    id: "iron_sword",
    name: "Iron Sword",
    type: "weapon",
    sellPrice: 70,
    weapon: { attackBonus: 12, strengthBonus: 11, speed: 2500 },
  },

  // --- Food (buy from shop / monster drops) ---
  { id: "bread", name: "Bread", type: "food", sellPrice: 1, heals: 5 },
  { id: "trout", name: "Trout", type: "food", sellPrice: 4, heals: 9 },

  // --- Misc loot ---
  { id: "bones", name: "Bones", type: "misc", sellPrice: 1 },
  { id: "feathers", name: "Feathers", type: "misc", sellPrice: 1 },
];

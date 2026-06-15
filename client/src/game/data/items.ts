import type { Item } from "../types";

export const ITEMS: Item[] = [
  // --- 資源 ---
  { id: "commit", name: "コミット", type: "resource", icon: "commit", sellPrice: 2 },
  { id: "product", name: "プロダクト", type: "bar", icon: "product", sellPrice: 30 },

  // --- エディタ (武器枠 / ショップで購入) ---
  {
    id: "vscode",
    name: "VSCode",
    type: "weapon",
    icon: "editor",
    sellPrice: 40,
    weapon: { attackBonus: 6, strengthBonus: 5, speed: 2600 },
  },
  {
    id: "vim",
    name: "Vim",
    type: "weapon",
    icon: "editor",
    sellPrice: 90,
    weapon: { attackBonus: 13, strengthBonus: 10, speed: 2200 },
  },
  {
    id: "jetbrains",
    name: "JetBrains IDE",
    type: "weapon",
    icon: "editor",
    sellPrice: 220,
    weapon: { attackBonus: 16, strengthBonus: 20, speed: 2600 },
  },

  // --- カフェイン / 回復 ---
  { id: "coffee", name: "コーヒー", type: "food", icon: "coffee", sellPrice: 3, heals: 5 },
  { id: "energy_drink", name: "栄養ドリンク", type: "food", icon: "coffee", sellPrice: 8, heals: 12 },
  { id: "paid_leave", name: "有給", type: "food", icon: "coffee", sellPrice: 30, heals: 45 },

  // --- その他ドロップ ---
  { id: "tech_debt", name: "技術的負債", type: "misc", icon: "techdebt", sellPrice: 1 },
  { id: "kudos", name: "感謝", type: "misc", icon: "kudos", sellPrice: 3 },
  { id: "cert", name: "資格", type: "misc", icon: "cert", sellPrice: 60 },
];

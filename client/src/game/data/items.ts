import type { Item } from "../types";

// 追加すればバンク/売却/装備/消費に自動で乗る。
export const ITEMS: Item[] = [
  // --- 資源 (生産で出る) ---
  { id: "knowledge", name: "知識", type: "resource", sellPrice: 3 },
  { id: "code", name: "コード", type: "resource", sellPrice: 2 },
  { id: "snippet", name: "スニペット", type: "resource", sellPrice: 2 },

  // --- 中間成果物 (制作で出る) ---
  { id: "design_doc", name: "設計書", type: "bar", sellPrice: 10 },
  { id: "feature", name: "機能", type: "bar", sellPrice: 25 },
  { id: "quality_feature", name: "検証済み機能", type: "bar", sellPrice: 55 },
  { id: "tool_parts", name: "ツール素材", type: "bar", sellPrice: 8 },

  // --- エディタ (武器枠 / 環境構築で作る) ---
  {
    id: "vscode",
    name: "VSCode",
    type: "weapon",
    sellPrice: 40,
    weapon: { attackBonus: 6, strengthBonus: 5, speed: 2600 },
  },
  {
    id: "vim",
    name: "Vim",
    type: "weapon",
    sellPrice: 90,
    weapon: { attackBonus: 13, strengthBonus: 10, speed: 2200 },
  },
  {
    id: "jetbrains",
    name: "JetBrains IDE",
    type: "weapon",
    sellPrice: 220,
    weapon: { attackBonus: 16, strengthBonus: 20, speed: 2600 },
  },

  // --- カフェイン / 回復 (旧food) ---
  { id: "coffee", name: "コーヒー", type: "food", sellPrice: 3, heals: 5 },
  { id: "energy_drink", name: "栄養ドリンク", type: "food", sellPrice: 8, heals: 12 },
  { id: "paid_leave", name: "有給", type: "food", sellPrice: 30, heals: 45 },

  // --- その他ドロップ ---
  { id: "tech_debt", name: "技術的負債", type: "misc", sellPrice: 1 },
  { id: "kudos", name: "感謝", type: "misc", sellPrice: 3 },
];

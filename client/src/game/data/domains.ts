import type { Domain } from "../types";

// 技術分野。スキル(言語/フレームワーク)をまとめる軸。追加すればサイドバーに増える。
export const DOMAINS: Domain[] = [
  { id: "web", name: "Web", icon: "web" },
  { id: "game", name: "ゲーム", icon: "game" },
  { id: "embedded", name: "組み込み", icon: "embedded" },
  { id: "ai", name: "AI・データ", icon: "ai" },
];

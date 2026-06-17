import type { SkillCategory } from "../types";

export interface SkillCategoryDef {
  id: SkillCategory;
  name: string;
  icon: string;
}

// サイドバーの大分類（この順で表示）。combat(現場力)はステータス表示に集約し一覧には出さない。
export const CATEGORIES: SkillCategoryDef[] = [
  { id: "language", name: "言語", icon: "g_script" },
  { id: "platform", name: "領域・プラットフォーム", icon: "platform" },
  { id: "infra", name: "インフラ・基盤", icon: "infra" },
  { id: "domain", name: "業界ドメイン", icon: "domain" },
  { id: "craft", name: "クラフト", icon: "cooking" },
];

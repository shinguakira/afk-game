import type { SkillCategory } from "../types";

export interface SkillCategoryDef {
  id: SkillCategory;
  name: string;
  icon: string;
}

// サイドバーの大分類（この順で表示）。combat(現場力)はステータス表示に集約し一覧には出さない。
export const CATEGORIES: SkillCategoryDef[] = [
  { id: "language", name: "言語", icon: "g_script" },
  { id: "infra", name: "インフラ・クラウド", icon: "infra" },
  { id: "domain", name: "ドメイン・業界", icon: "domain" },
  { id: "craft", name: "クラフト", icon: "cooking" },
];

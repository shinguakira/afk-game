// サイドバーの折りたたみグループ（Melvor の左メニュー構造を踏襲）。
// 言語は系統(family)で、フレームワークは分野(domain)でまとめる。
export interface SkillGroup {
  id: string;
  name: string;
  icon: string;
  section: "lang" | "fw";
}

export const GROUPS: SkillGroup[] = [
  // --- 言語: 系統別 ---
  { id: "g_script", name: "スクリプト系", icon: "g_script", section: "lang" },
  { id: "g_systems", name: "システム系", icon: "g_systems", section: "lang" },
  { id: "g_enterprise", name: "JVM / .NET 系", icon: "g_enterprise", section: "lang" },
  { id: "g_native", name: "ネイティブ / モバイル", icon: "g_native", section: "lang" },
  { id: "g_func", name: "関数型", icon: "g_func", section: "lang" },
  { id: "g_data", name: "データ / 科学", icon: "g_data", section: "lang" },
  { id: "g_legacy", name: "レガシー", icon: "g_legacy", section: "lang" },

  // --- フレームワーク: 分野別 ---
  { id: "fw_web", name: "Web", icon: "web", section: "fw" },
  { id: "fw_mobile", name: "モバイル", icon: "mobile", section: "fw" },
  { id: "fw_game", name: "ゲーム", icon: "game", section: "fw" },
  { id: "fw_ai", name: "AI・データ", icon: "ai", section: "fw" },
  { id: "fw_infra", name: "インフラ", icon: "infra", section: "fw" },
];

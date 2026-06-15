import type { GameAction } from "../types";

// 生産 + 制作。遂行(戦闘)は monsters.ts。
export const ACTIONS: GameAction[] = [
  // ===== 生産 (gather) =====
  // -- 学習 --
  {
    id: "study",
    skill: "learning",
    name: "ドキュメントを読む",
    level: 1,
    time: 3000,
    xp: 15,
    outputs: { knowledge: 1 },
  },
  {
    id: "read_book",
    skill: "learning",
    name: "専門書を精読",
    level: 15,
    time: 4500,
    xp: 38,
    outputs: { knowledge: 2 },
  },
  // -- コーディング --
  {
    id: "write_code",
    skill: "coding",
    name: "コードを書く",
    level: 1,
    time: 3000,
    xp: 15,
    outputs: { code: 1 },
  },
  {
    id: "refactor",
    skill: "coding",
    name: "リファクタリング",
    level: 10,
    time: 3500,
    xp: 28,
    outputs: { code: 2 },
  },
  // -- 情報収集 --
  {
    id: "google",
    skill: "research",
    name: "ググる / Stack Overflow",
    level: 1,
    time: 3200,
    xp: 14,
    outputs: { snippet: 1 },
  },
  {
    id: "read_oss",
    skill: "research",
    name: "OSSのコードを読む",
    level: 12,
    time: 4000,
    xp: 30,
    outputs: { snippet: 2 },
  },
  // -- カフェイン精製 (回復アイテム生産) --
  {
    id: "brew_coffee",
    skill: "caffeine",
    name: "コーヒーを淹れる",
    level: 1,
    time: 2800,
    xp: 12,
    outputs: { coffee: 1 },
  },
  {
    id: "brew_energy",
    skill: "caffeine",
    name: "栄養ドリンクを調合",
    level: 12,
    time: 3600,
    xp: 26,
    outputs: { energy_drink: 1 },
  },

  // ===== 制作 (craft) =====
  // -- 設計 --
  {
    id: "write_design",
    skill: "design",
    name: "設計書を書く",
    level: 1,
    time: 2600,
    xp: 16,
    inputs: { knowledge: 3 },
    outputs: { design_doc: 1 },
  },
  // -- 開発 --
  {
    id: "implement_feature",
    skill: "development",
    name: "機能を実装",
    level: 1,
    time: 3000,
    xp: 22,
    inputs: { design_doc: 1, code: 2 },
    outputs: { feature: 1 },
  },
  // -- テスト --
  {
    id: "run_tests",
    skill: "testing",
    name: "テストを書いて回す",
    level: 1,
    time: 2800,
    xp: 24,
    inputs: { feature: 1, snippet: 1 },
    outputs: { quality_feature: 1 },
  },
  // -- 環境構築 + エディタ作成 --
  {
    id: "setup_env",
    skill: "devops",
    name: "開発環境を整える",
    level: 1,
    time: 3000,
    xp: 18,
    inputs: { code: 4 },
    outputs: { tool_parts: 1 },
  },
  {
    id: "build_vscode",
    skill: "devops",
    name: "VSCode をセットアップ",
    level: 4,
    time: 3400,
    xp: 30,
    inputs: { tool_parts: 2, knowledge: 2 },
    outputs: { vscode: 1 },
  },
  {
    id: "build_vim",
    skill: "devops",
    name: "Vim を極める",
    level: 12,
    time: 3800,
    xp: 48,
    inputs: { tool_parts: 4, snippet: 4 },
    outputs: { vim: 1 },
  },
  {
    id: "build_jetbrains",
    skill: "devops",
    name: "JetBrains を導入",
    level: 20,
    time: 4200,
    xp: 70,
    inputs: { tool_parts: 6, quality_feature: 2 },
    outputs: { jetbrains: 1 },
  },
];

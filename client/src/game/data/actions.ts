import type { GameAction } from "../types";

// 言語(gather): コードを書いて コミット を産み、その言語レベルを上げる。
// フレームワーク(craft): 対応言語のレベルを要求し、コミットを消費して
// プロダクトを産む。フレームワークのレベルも上がる。
const lang = (
  id: string,
  skill: string,
  name: string,
  time: number,
  xp: number,
): GameAction => ({ id, skill, name, level: 1, time, xp, outputs: { commit: 1 } });

const framework = (
  id: string,
  skill: string,
  name: string,
  reqSkill: string,
  reqLevel: number,
  commits: number,
  time: number,
  xp: number,
): GameAction => ({
  id,
  skill,
  name,
  level: 1,
  time,
  xp,
  inputs: { commit: commits },
  outputs: { product: 1 },
  requires: { skill: reqSkill, level: reqLevel },
});

export const ACTIONS: GameAction[] = [
  // ===== 言語 =====
  lang("write_js", "js", "JavaScript を書く", 3000, 15),
  lang("write_ts", "ts", "TypeScript を書く", 3100, 16),
  lang("write_csharp", "csharp", "C# を書く", 3100, 16),
  lang("write_cpp", "cpp", "C++ を書く", 3300, 18),
  lang("write_c", "c", "C を書く", 3300, 18),
  lang("write_rust", "rust", "Rust を書く", 3400, 19),
  lang("write_python", "python", "Python を書く", 3000, 15),

  // ===== フレームワーク =====
  framework("build_react", "react", "React で実装", "ts", 5, 4, 3200, 26),
  framework("build_node", "node", "Node.js で API 実装", "js", 5, 4, 3200, 24),
  framework("build_unity", "unity", "Unity で開発", "csharp", 5, 4, 3300, 28),
  framework("build_unreal", "unreal", "Unreal で開発", "cpp", 8, 6, 3600, 40),
  framework("build_arduino", "arduino", "Arduino で実装", "c", 4, 3, 3200, 22),
  framework("build_embassy", "embassy", "Embassy で実装", "rust", 8, 5, 3500, 38),
  framework("build_pandas", "pandas", "pandas で分析", "python", 4, 3, 3200, 22),
  framework("build_pytorch", "pytorch", "PyTorch で学習", "python", 8, 5, 3500, 40),
  framework("build_tensorflow", "tensorflow", "TensorFlow で学習", "python", 8, 5, 3500, 40),
];

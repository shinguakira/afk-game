import type { Skill } from "../types";

const lang = (id: string, name: string, group: string, icon = id): Skill => ({
  id,
  name,
  kind: "gather",
  tech: "language",
  group,
  icon,
});
const fw = (id: string, name: string, group: string, icon = id): Skill => ({
  id,
  name,
  kind: "craft",
  tech: "framework",
  group,
  icon,
});

// スキル = 実在の技術スタック。言語(系統別) と フレームワーク(分野別) を個別にレベリング。
// フレームワークは actions.ts の `requires` で対応言語の最低レベルを要求する。
export const SKILLS: Skill[] = [
  // ===== 言語: スクリプト系 =====
  lang("js", "JavaScript", "g_script", "javascript"),
  lang("ts", "TypeScript", "g_script", "typescript"),
  lang("python", "Python", "g_script"),
  lang("ruby", "Ruby", "g_script"),
  lang("php", "PHP", "g_script"),
  lang("lua", "Lua", "g_script"),
  lang("perl", "Perl", "g_script"),

  // ===== 言語: システム系 =====
  lang("c", "C", "g_systems"),
  lang("cpp", "C++", "g_systems"),
  lang("rust", "Rust", "g_systems"),
  lang("go", "Go", "g_systems"),
  lang("zig", "Zig", "g_systems"),

  // ===== 言語: JVM / .NET 系 =====
  lang("java", "Java", "g_enterprise"),
  lang("kotlin", "Kotlin", "g_enterprise"),
  lang("scala", "Scala", "g_enterprise"),
  lang("csharp", "C#", "g_enterprise"),

  // ===== 言語: ネイティブ / モバイル =====
  lang("swift", "Swift", "g_native"),
  lang("dart", "Dart", "g_native"),
  lang("objc", "Objective-C", "g_native"),

  // ===== 言語: 関数型 =====
  lang("haskell", "Haskell", "g_func"),
  lang("elixir", "Elixir", "g_func"),
  lang("clojure", "Clojure", "g_func"),
  lang("fsharp", "F#", "g_func"),
  lang("erlang", "Erlang", "g_func"),

  // ===== 言語: データ / 科学 =====
  lang("r", "R", "g_data"),
  lang("julia", "Julia", "g_data"),
  lang("sql", "SQL", "g_data"),

  // ===== 言語: レガシー =====
  lang("cobol", "COBOL", "g_legacy"),
  lang("fortran", "Fortran", "g_legacy"),
  lang("asm", "Assembly", "g_legacy"),

  // ===== フレームワーク: Web =====
  fw("react", "React", "fw_web"),
  fw("vue", "Vue", "fw_web"),
  fw("svelte", "Svelte", "fw_web"),
  fw("angular", "Angular", "fw_web"),
  fw("nextjs", "Next.js", "fw_web"),
  fw("node", "Node.js", "fw_web"),
  fw("django", "Django", "fw_web"),
  fw("rails", "Ruby on Rails", "fw_web"),
  fw("spring", "Spring", "fw_web"),
  fw("laravel", "Laravel", "fw_web"),

  // ===== フレームワーク: モバイル =====
  fw("flutter", "Flutter", "fw_mobile"),
  fw("reactnative", "React Native", "fw_mobile"),
  fw("swiftui", "SwiftUI", "fw_mobile"),
  fw("compose", "Jetpack Compose", "fw_mobile"),

  // ===== フレームワーク: ゲーム =====
  fw("unity", "Unity", "fw_game"),
  fw("unreal", "Unreal Engine", "fw_game"),
  fw("godot", "Godot", "fw_game"),

  // ===== フレームワーク: AI・データ =====
  fw("pytorch", "PyTorch", "fw_ai"),
  fw("tensorflow", "TensorFlow", "fw_ai"),
  fw("pandas", "pandas", "fw_ai"),
  fw("sklearn", "scikit-learn", "fw_ai"),

  // ===== フレームワーク: インフラ =====
  fw("docker", "Docker", "fw_infra"),
  fw("kubernetes", "Kubernetes", "fw_infra"),
  fw("terraform", "Terraform", "fw_infra"),

  // ===== 現場力 (combat stats) =====
  { id: "debug", name: "デバッグ力", kind: "combat", icon: "debug" },
  { id: "impl", name: "実装力", kind: "combat", icon: "impl" },
  { id: "robust", name: "堅牢性", kind: "combat", icon: "robust" },
  { id: "mental", name: "メンタル", kind: "combat", icon: "mental" },
];

/** Combat mechanics → themed skill ids. */
export const STAT = {
  accuracy: "debug",
  damage: "impl",
  defence: "robust",
  mental: "mental",
} as const;

export const COMBAT_STAT_IDS = [
  STAT.accuracy,
  STAT.damage,
  STAT.defence,
  STAT.mental,
] as const;

export const STARTING_MENTAL_LEVEL = 10;

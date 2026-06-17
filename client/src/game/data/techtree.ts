import type { GameAction, Skill } from "../types";
import { LANG_URLS, TECH_URLS, CERT_URLS } from "./links";

// 言語ごとの「傘下」コンテンツ。フレームワーク・ライブラリ・概念は
// すべてその言語スキルのアクション(パターン)として生成される。
type Entry = [name: string, level: number, icon?: string];

// 言語とは別軸の「領域・プラットフォーム(何を作るか)」。フレームワーク実装で副次獲得。
// id は sectors.ts の PLATFORM と一致（スキルidは plat_${PlatformId}）。
// ※業界ドメイン(金融/医療/法務…)はフレームワークでは伸びない別軸なのでここには含めない。
export type PlatformId = "web" | "game" | "mobile" | "embedded" | "ai" | "data";

// フレームワークは言語(主)に加えてプラットフォーム(副)へも経験値を入れる橋渡し。
// 4要素目に紐づくプラットフォームを指定（無いものは言語のみ＝特定領域に属さない汎用FW）。
type Fw = [name: string, level: number, icon?: string, platform?: PlatformId];

interface LangSpec {
  id: string;
  name: string;
  group: string;
  icon?: string;
  baseTime?: number;
  baseXp?: number;
  concepts?: Entry[];
  libraries?: Entry[];
  frameworks?: Fw[];
  oss?: number; // OSSコミット解禁Lv
  cert?: [name: string, level: number];
}

// 既にアイコンレジストリにあるブランドid（無いものは category 既定アイコンに落ちる）
const LANGS: LangSpec[] = [
  // ===== スクリプト系 =====
  {
    id: "js", name: "JavaScript", group: "g_script", icon: "javascript",
    concepts: [["プロトタイプ継承", 3], ["クロージャ", 4], ["非同期 / Promise", 6], ["イベントループ", 9]],
    libraries: [["jQuery", 2, "jquery"], ["Lodash", 4], ["Axios", 5, "axios"]],
    frameworks: [["Node.js", 8, "node", "web"], ["Express", 9, "express", "web"], ["Vue", 11, "vue", "web"], ["Svelte", 14, "svelte", "web"]],
    oss: 18, cert: ["JavaScript 認定 (JSNAD)", 35],
  },
  {
    id: "ts", name: "TypeScript", group: "g_script", icon: "typescript",
    concepts: [["型注釈", 2], ["ジェネリクス", 6], ["型ガード", 9], ["Conditional Types", 14]],
    libraries: [["Zod", 8]],
    frameworks: [["React", 5, "react", "web"], ["Next.js", 10, "nextjs", "web"], ["Angular", 13, "angular", "web"]],
    oss: 20, cert: ["TypeScript 認定", 38],
  },
  {
    id: "python", name: "Python", group: "g_script", icon: "python",
    concepts: [["リスト内包表記", 3], ["デコレータ", 6], ["ジェネレータ", 8], ["GIL", 12]],
    libraries: [["Requests", 4], ["NumPy", 5, "numpy"], ["pandas", 7, "pandas"]],
    frameworks: [["Flask", 6, "flask", "web"], ["Django", 9, "django", "web"], ["FastAPI", 10, "fastapi", "web"], ["scikit-learn", 12, "sklearn", "ai"], ["PyTorch", 16, "pytorch", "ai"], ["TensorFlow", 16, "tensorflow", "ai"]],
    oss: 16, cert: ["Python エンジニア認定", 36],
  },
  {
    id: "ruby", name: "Ruby", group: "g_script", icon: "ruby",
    concepts: [["ブロックと yield", 3], ["メタプログラミング", 8]],
    libraries: [["RSpec", 5]],
    frameworks: [["Sinatra", 6, undefined, "web"], ["Ruby on Rails", 8, "rails", "web"]],
    oss: 20, cert: ["Ruby 技術者認定", 34],
  },
  {
    id: "php", name: "PHP", group: "g_script", icon: "php",
    concepts: [["PSR 標準", 4], ["Composer 依存管理", 5]],
    frameworks: [["Laravel", 7, "laravel", "web"], ["Symfony", 12, "symfony", "web"]],
    oss: 22, cert: ["PHP 技術者認定", 32],
  },
  {
    id: "lua", name: "Lua", group: "g_script", icon: "lua",
    concepts: [["メタテーブル", 5], ["コルーチン", 8]],
    frameworks: [["LÖVE", 9, undefined, "game"]],
    oss: 24,
  },
  {
    id: "perl", name: "Perl", group: "g_script", icon: "perl",
    concepts: [["正規表現", 4], ["コンテキスト", 7]],
    oss: 26,
  },

  // ===== システム系 =====
  {
    id: "c", name: "C", group: "g_systems",
    concepts: [["ポインタ", 4], ["ビット演算", 6], ["手動メモリ管理", 8]],
    frameworks: [["Arduino", 6, "arduino", "embedded"]],
    oss: 24, cert: ["組込み技術者試験 (ETEC)", 38],
  },
  {
    id: "cpp", name: "C++", group: "g_systems",
    concepts: [["STL", 5], ["RAII", 7], ["テンプレート", 9], ["ムーブセマンティクス", 12]],
    frameworks: [["Qt", 10, "qt"], ["Godot", 11, "godot", "game"], ["Unreal Engine", 15, "unreal", "game"]],
    oss: 24, cert: ["C++ 認定 (CPP)", 40],
  },
  {
    id: "rust", name: "Rust", group: "g_systems",
    concepts: [["所有権", 4], ["借用チェッカ", 6], ["ライフタイム", 9], ["トレイト", 8]],
    frameworks: [["Tokio", 12], ["Actix", 14, undefined, "web"], ["Embassy", 16, undefined, "embedded"]],
    oss: 22, cert: ["Rust 認定", 40],
  },
  {
    id: "go", name: "Go", group: "g_systems",
    concepts: [["defer", 4], ["goroutine", 6], ["channel", 8]],
    frameworks: [["Gin", 8, undefined, "web"], ["Echo", 12, undefined, "web"]],
    oss: 16, cert: ["Go 認定", 36],
  },
  {
    id: "zig", name: "Zig", group: "g_systems",
    concepts: [["comptime", 8], ["手動アロケータ", 10]],
    oss: 26,
  },

  // ===== JVM / .NET 系 =====
  {
    id: "java", name: "Java", group: "g_enterprise", icon: "java",
    concepts: [["OOP", 3], ["ジェネリクス", 7], ["Stream API", 9]],
    libraries: [["JUnit", 5]],
    frameworks: [["Spring", 8, "spring", "web"], ["Hibernate", 12]],
    oss: 20, cert: ["Java Gold (OCJP)", 40],
  },
  {
    id: "kotlin", name: "Kotlin", group: "g_enterprise", icon: "kotlin",
    concepts: [["null 安全", 4], ["コルーチン", 8]],
    frameworks: [["Ktor", 10, "ktor", "web"], ["Jetpack Compose", 12, "compose", "mobile"]],
    oss: 22, cert: ["Kotlin 認定", 36],
  },
  {
    id: "scala", name: "Scala", group: "g_enterprise", icon: "scala",
    concepts: [["パターンマッチ", 5], ["implicit", 9], ["モナド", 13]],
    frameworks: [["Play", 10, undefined, "web"], ["Akka", 12]],
    oss: 26,
  },
  {
    id: "csharp", name: "C#", group: "g_enterprise", icon: "csharp",
    concepts: [["delegate", 5], ["LINQ", 6], ["async / await", 8]],
    frameworks: [[".NET", 6, "dotnet"], ["Unity", 9, "unity", "game"], ["ASP.NET", 11, "dotnet", "web"]],
    oss: 20, cert: ["C# / .NET 認定", 38],
  },

  // ===== ネイティブ / モバイル =====
  {
    id: "swift", name: "Swift", group: "g_native", icon: "swift",
    concepts: [["Optional", 4], ["ARC", 8], ["プロトコル指向", 10]],
    frameworks: [["UIKit", 6, undefined, "mobile"], ["SwiftUI", 9, undefined, "mobile"]],
    oss: 22, cert: ["Swift 認定", 36],
  },
  {
    id: "dart", name: "Dart", group: "g_native", icon: "dart",
    concepts: [["Future / async", 5], ["null safety", 4]],
    frameworks: [["Flutter", 7, "flutter", "mobile"]],
    oss: 22, cert: ["Flutter 認定", 34],
  },
  {
    id: "objc", name: "Objective-C", group: "g_native", icon: "objc",
    concepts: [["メッセージング", 6], ["手動 retain/release", 9]],
    frameworks: [["Cocoa", 10]],
    oss: 26,
  },

  // ===== 関数型 =====
  {
    id: "haskell", name: "Haskell", group: "g_func", icon: "haskell",
    concepts: [["純粋関数", 4], ["型クラス", 7], ["モナド", 9], ["遅延評価", 11]],
    oss: 26, cert: ["Haskell 上級認定", 40],
  },
  {
    id: "elixir", name: "Elixir", group: "g_func", icon: "elixir",
    concepts: [["パターンマッチ", 5], ["アクターモデル", 7]],
    frameworks: [["Phoenix", 9, "phoenix", "web"]],
    oss: 24,
  },
  {
    id: "clojure", name: "Clojure", group: "g_func", icon: "clojure",
    concepts: [["不変データ", 5], ["REPL 駆動", 6], ["マクロ", 10]],
    oss: 26,
  },
  {
    id: "fsharp", name: "F#", group: "g_func", icon: "fsharp",
    concepts: [["判別共用体", 6], ["コンピュテーション式", 11]],
    frameworks: [[".NET", 8, "dotnet"]],
    oss: 26,
  },
  {
    id: "erlang", name: "Erlang", group: "g_func", icon: "erlang",
    concepts: [["軽量プロセス", 6], ["OTP", 10], ["let it crash", 8]],
    oss: 28,
  },

  // ===== データ / 科学 =====
  {
    id: "r", name: "R", group: "g_data", icon: "r",
    concepts: [["ベクトル化", 4], ["データフレーム", 6]],
    libraries: [["tidyverse", 7], ["ggplot2", 8]],
    oss: 22, cert: ["統計検定", 30],
  },
  {
    id: "julia", name: "Julia", group: "g_data", icon: "julia",
    concepts: [["多重ディスパッチ", 6], ["JIT コンパイル", 8]],
    frameworks: [["Flux", 12, undefined, "ai"]],
    oss: 26,
  },
  {
    id: "sql", name: "SQL", group: "g_data", icon: "sql",
    concepts: [["JOIN", 3], ["インデックス設計", 6], ["正規化", 7], ["ウィンドウ関数", 9]],
    oss: 20, cert: ["OSS-DB / DB スペシャリスト", 34],
  },

  // ===== レガシー =====
  {
    id: "cobol", name: "COBOL", group: "g_legacy", icon: "cobol",
    concepts: [["固定長レコード", 5], ["JCL 連携", 8]],
    oss: 30, cert: ["COBOL 技術者認定", 36],
  },
  {
    id: "fortran", name: "Fortran", group: "g_legacy", icon: "fortran",
    concepts: [["配列演算", 5], ["OpenMP", 9]],
    oss: 28,
  },
  {
    id: "asm", name: "Assembly", group: "g_legacy", icon: "asm",
    concepts: [["レジスタ", 6], ["スタックフレーム", 9], ["SIMD", 12]],
    oss: 30,
  },
];

function slug(s: string): string {
  const t = s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return t || "x";
}

/** 言語スキル一覧（combat ステは skills.ts 側で付与）。 */
export function buildLangSkills(): Skill[] {
  return LANGS.map((l) => ({
    id: l.id,
    name: l.name,
    kind: "gather",
    tech: "language",
    category: "language",
    icon: l.icon ?? l.id,
    url: LANG_URLS[l.id],
  }));
}

/** 全アクションを生成。各言語の base / concept / library / framework / oss / cert。 */
export function buildActions(): GameAction[] {
  const out: GameAction[] = [];
  for (const l of LANGS) {
    const sk = l.id;
    // base: コードを書く
    out.push({
      id: `code_${sk}`,
      skill: sk,
      name: `${l.name} を書く`,
      category: "base",
      icon: l.icon ?? l.id,
      level: 1,
      time: l.baseTime ?? 3000,
      xp: l.baseXp ?? 15,
      outputs: { commit: 1 },
    });
    // concepts: 概念を理解（コミット産出）。名前は日本語でslug化できないので index で一意化。
    (l.concepts ?? []).forEach(([name, level], i) => {
      out.push({
        id: `concept_${sk}_${i}`,
        skill: sk,
        name: `${name} を理解`,
        category: "concept",
        icon: "concept",
        level,
        time: 3200,
        xp: 14 + level * 2,
        outputs: { commit: 1 },
      });
    });
    // libraries: ライブラリを使う（コミット多め）
    (l.libraries ?? []).forEach(([name, level, icon], i) => {
      out.push({
        id: `lib_${sk}_${i}`,
        skill: sk,
        name: `${name} を使う`,
        category: "library",
        icon: icon ?? "library",
        level,
        time: 3300,
        xp: 16 + level * 2,
        url: TECH_URLS[name],
        outputs: { commit: 2 },
      });
    });
    // frameworks: コミット(基礎で書いた成果)を消費して、より大きな経験値に変える上位アクション。
    // プラットフォーム紐づけがあれば、言語(主)に加えて領域(副: 約60%)へも経験値が入る。
    for (const [name, level, icon, platform] of l.frameworks ?? []) {
      const fxp = 18 + level * 2.5;
      out.push({
        id: `fw_${sk}_${slug(name)}`,
        skill: sk,
        name: `${name} で実装`,
        category: "framework",
        icon: icon ?? "framework",
        level,
        time: 3400,
        xp: fxp,
        url: TECH_URLS[name],
        ...(platform
          ? { xpAlso: { skill: `plat_${platform}`, xp: Math.round(fxp * 0.6) } }
          : {}),
        inputs: { commit: 3 + Math.floor(level / 4) },
        outputs: {},
      });
    }
    // OSS コミット（抽象的な実績＝高XPのみ。アイテムは生まない）
    out.push({
      id: `oss_${sk}`,
      skill: sk,
      name: "OSS にコミット",
      category: "oss",
      icon: "oss",
      level: l.oss ?? 22,
      time: 4200,
      xp: 50 + (l.oss ?? 22) * 2,
      outputs: {},
    });
    // 資格（高XPの到達目標。アイテム化しない＝状態/効果は将来別途）
    const cert = l.cert ?? [`${l.name} 上級認定`, 36];
    out.push({
      id: `cert_${sk}`,
      skill: sk,
      name: `${cert[0]} を取得`,
      category: "cert",
      icon: "cert",
      level: cert[1],
      time: 5200,
      xp: 100 + cert[1] * 3,
      url: CERT_URLS[l.id],
      outputs: {},
    });
  }
  return out;
}

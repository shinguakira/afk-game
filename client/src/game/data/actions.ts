import type { GameAction } from "../types";
import { SKILLS } from "./skills";

// 表示名はスキルから引く（DRY）。
const NAME: Record<string, string> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s.name]),
);

// 言語: [id, time(ms), xp]。コードを書いて コミット を産む。
const LANGS: [string, number, number][] = [
  ["js", 3000, 15], ["ts", 3100, 16], ["python", 3000, 15], ["ruby", 3100, 16],
  ["php", 3100, 16], ["lua", 3000, 14], ["perl", 3200, 16],
  ["c", 3300, 18], ["cpp", 3300, 18], ["rust", 3400, 19], ["go", 3100, 16], ["zig", 3400, 19],
  ["java", 3100, 16], ["kotlin", 3100, 16], ["scala", 3300, 18], ["csharp", 3100, 16],
  ["swift", 3100, 16], ["dart", 3000, 15], ["objc", 3300, 18],
  ["haskell", 3500, 21], ["elixir", 3300, 18], ["clojure", 3400, 19], ["fsharp", 3300, 18], ["erlang", 3400, 19],
  ["r", 3000, 15], ["julia", 3100, 16], ["sql", 2800, 13],
  ["cobol", 3600, 22], ["fortran", 3500, 21], ["asm", 3700, 24],
];

// フレームワーク: [id, 要求言語, 要求Lv, 消費コミット, time, xp]。
const FWS: [string, string, number, number, number, number][] = [
  ["react", "ts", 5, 4, 3200, 26], ["vue", "js", 5, 4, 3200, 24],
  ["svelte", "js", 8, 4, 3300, 30], ["angular", "ts", 8, 5, 3400, 34],
  ["nextjs", "react", 5, 5, 3500, 38], ["node", "js", 5, 4, 3200, 24],
  ["django", "python", 5, 4, 3300, 28], ["rails", "ruby", 5, 4, 3300, 28],
  ["spring", "java", 5, 5, 3400, 32], ["laravel", "php", 5, 4, 3300, 28],
  ["flutter", "dart", 5, 4, 3300, 28], ["reactnative", "js", 8, 5, 3400, 34],
  ["swiftui", "swift", 5, 4, 3300, 28], ["compose", "kotlin", 5, 4, 3300, 28],
  ["unity", "csharp", 5, 4, 3300, 28], ["unreal", "cpp", 8, 6, 3600, 42],
  ["godot", "cpp", 5, 5, 3400, 32],
  ["pytorch", "python", 8, 5, 3500, 40], ["tensorflow", "python", 8, 5, 3500, 40],
  ["pandas", "python", 4, 3, 3200, 22], ["sklearn", "python", 6, 4, 3300, 30],
  ["docker", "go", 5, 3, 3100, 22], ["kubernetes", "go", 8, 5, 3500, 38],
  ["terraform", "go", 5, 3, 3100, 22],
];

export const ACTIONS: GameAction[] = [
  ...LANGS.map(
    ([id, time, xp]): GameAction => ({
      id: `write_${id}`,
      skill: id,
      name: `${NAME[id]} を書く`,
      level: 1,
      time,
      xp,
      outputs: { commit: 1 },
    }),
  ),
  ...FWS.map(
    ([id, reqSkill, reqLevel, commits, time, xp]): GameAction => ({
      id: `build_${id}`,
      skill: id,
      name: `${NAME[id]} で実装`,
      level: 1,
      time,
      xp,
      inputs: { commit: commits },
      outputs: { product: 1 },
      requires: { skill: reqSkill, level: reqLevel },
    }),
  ),
];

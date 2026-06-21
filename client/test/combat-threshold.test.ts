/**
 * Monster viability tests: minimum player stats to defeat each monster type.
 *
 * Strategy: analytic expected-value formulas from lib/combat.ts (no random rolls).
 * "survives" = expected HP lost per kill < player maxHp (no food consumed).
 * Mental is held at Lv10 for most tests (100 HP baseline).
 *
 * Language variants (bugfix_typescript, feature_rust, etc.):
 *   - Tested WITHOUT language skill (weakTo bonus = 0).
 *   - The expected table reflects the "unspecialised" baseline difficulty.
 *   - Players who have levelled the relevant language skill will clear them earlier.
 *
 * Run: npx vitest run test/combat-threshold.test.ts
 */
import { describe, expect, test } from "vitest";
import { getCombatStats, avgPlayerDamage, avgEnemyDamage } from "@/lib/combat";
import { MONSTER_MAP } from "@/constants/maps";
import { MONSTERS } from "@/constants/monsters";
import type { Monster } from "@/types/monsters";
import { withSkills } from "./helpers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Viability {
  canKill: boolean;
  survives: boolean;
  hpLostPerKill: number;
  playerDps: number;
  maxHp: number;
}

function viability(
  skills: { debug?: number; impl?: number; robust?: number; mental?: number },
  monsterId: string,
): Viability {
  const { debug = 1, impl = 1, robust = 1, mental = 10 } = skills;
  const monster = MONSTER_MAP[monsterId];
  if (!monster) throw new Error(`Unknown monster: ${monsterId}`);

  const state = withSkills({ debug, impl, robust, mental });
  const stats = getCombatStats(state);

  const playerDps = (avgPlayerDamage(stats, monster) * 1000) / stats.weaponSpeed;
  const canKill = !monster.regen || playerDps > monster.regen;

  let hpLostPerKill = Infinity;
  if (canKill) {
    const netDps = monster.regen ? playerDps - monster.regen : playerDps;
    const timeToKill = monster.hp / netDps;
    const enemyDps = (avgEnemyDamage(stats, monster) * 1000) / monster.speed;
    const dotDps = monster.dot ?? 0;
    hpLostPerKill = (enemyDps + dotDps) * timeToKill;
  }

  return {
    canKill,
    survives: canKill && hpLostPerKill < stats.maxHp,
    hpLostPerKill,
    playerDps,
    maxHp: stats.maxHp,
  };
}

function findMinBalancedLevel(monsterId: string): number {
  for (let lv = 1; lv <= 99; lv++) {
    const mental = Math.max(lv, 10);
    if (viability({ debug: lv, impl: lv, robust: lv, mental }, monsterId).survives) {
      return lv;
    }
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Minimum balanced level table
// Covers key variants per template + all special/upper monsters.
// ---------------------------------------------------------------------------

describe("minimum balanced level per monster (debug = impl = robust = lv, mental = max(lv,10))", () => {
  const expected: Record<string, number> = {
    // バグ修正 variants — trivially easy regardless of language
    bugfix_php: 1, bugfix_javascript: 1, bugfix_rust: 1,

    // LP制作 variants — easy, Lv1 across all languages
    lp_php: 1, lp_javascript: 1, lp_rust: 1,

    // 仕様変更 variants — regen=1.2 gates all equally at Lv18
    spec_change_php: 18, spec_change_javascript: 18, spec_change_rust: 18,

    // 機能開発 variants — language difficulty shows: php/js Lv1, rust Lv3
    feature_php: 1, feature_ruby: 1, feature_javascript: 1, feature_python: 1,
    feature_java: 2, feature_csharp: 2, feature_typescript: 2, feature_kotlin: 2,
    feature_go: 2, feature_rust: 3,

    // コードレビュー variants — high base defence makes language mult visible
    review_php: 1, review_ruby: 2, review_javascript: 2, review_python: 2,
    review_java: 2, review_csharp: 2, review_typescript: 2, review_kotlin: 2,
    review_go: 2, review_rust: 3,

    // Webアプリ受託 variants — PHP/Ruby easier, Rust hardest
    webapp_php: 3, webapp_ruby: 3,
    webapp_javascript: 4, webapp_python: 4, webapp_java: 4, webapp_csharp: 4,
    webapp_typescript: 5, webapp_kotlin: 5, webapp_go: 5, webapp_rust: 5,

    // 緊急障害対応 variants — dot=1.5/s; language adds +3 levels Lv10→Lv13
    incident_php: 10, incident_ruby: 10, incident_javascript: 10, incident_python: 10,
    incident_java: 11, incident_csharp: 11, incident_typescript: 11, incident_kotlin: 11,
    incident_go: 12, incident_rust: 13,

    // 言語固有の特殊案件
    ts_type_err: 3,   py_memleak: 13, go_goroutine: 20,
    rust_compile: 5,  sql_n1: 20,     enjou: 22,

    // 上位案件
    techdebt: 12, newproject: 15, perf_issue: 25, migration: 35,
  };

  for (const [id, minLv] of Object.entries(expected)) {
    test(`${id}: minimum balanced level = ${minLv}`, () => {
      expect(findMinBalancedLevel(id)).toBe(minLv);
    });
  }
});

// ---------------------------------------------------------------------------
// 仕様変更 variants — regen=1.2 gates all languages identically
// ---------------------------------------------------------------------------

describe("仕様変更 language variants: regen=1.2 gates all languages at Lv18", () => {
  test("PHP (0.9x mult): minLv still 18 — regen gating is language-independent", () => {
    const lv17 = viability({ debug: 17, impl: 17, robust: 17, mental: 17 }, "spec_change_php");
    const lv18 = viability({ debug: 18, impl: 18, robust: 18, mental: 18 }, "spec_change_php");
    expect(lv17.canKill).toBe(false);
    expect(lv18.canKill).toBe(true);
    expect(lv18.survives).toBe(true);
  });

  test("Rust (1.3x mult): minLv also 18 — higher defence barely affects DPS vs regen threshold", () => {
    const lv17 = viability({ debug: 17, impl: 17, robust: 17, mental: 17 }, "spec_change_rust");
    const lv18 = viability({ debug: 18, impl: 18, robust: 18, mental: 18 }, "spec_change_rust");
    expect(lv17.canKill).toBe(false);
    expect(lv18.canKill).toBe(true);
  });

  test("spec_change_rust takes longer to kill than PHP (same regen, more HP and defence)", () => {
    const php  = viability({ debug: 20, impl: 20, robust: 20, mental: 20 }, "spec_change_php");
    const rust = viability({ debug: 20, impl: 20, robust: 20, mental: 20 }, "spec_change_rust");
    expect(rust.hpLostPerKill).toBeGreaterThan(php.hpLostPerKill);
  });
});

// ---------------------------------------------------------------------------
// 機能開発 variants — language difficulty creates clear Lv1/2/3 tiers
// ---------------------------------------------------------------------------

describe("機能開発 language variants: PHP/JS Lv1, TS/Go Lv2, Rust Lv3", () => {
  test("PHP (0.9x): Lv1 viable — hp:23 def:7 is manageable (hpLost<100)", () => {
    const r = viability({ debug: 1, impl: 1, robust: 1, mental: 10 }, "feature_php");
    expect(r.survives).toBe(true);
  });

  test("JavaScript (1.0x): Lv1 barely survives (hpLost≈98.3/100)", () => {
    const r = viability({ debug: 1, impl: 1, robust: 1, mental: 10 }, "feature_javascript");
    expect(r.survives).toBe(true);
    expect(r.hpLostPerKill).toBeGreaterThan(90); // very tight
  });

  test("TypeScript (1.1x): Lv1 fails (def:9 raises kill time past breakeven)", () => {
    const r = viability({ debug: 1, impl: 1, robust: 1, mental: 10 }, "feature_typescript");
    expect(r.survives).toBe(false);
  });

  test("TypeScript (1.1x): Lv2 survives", () => {
    const r = viability({ debug: 2, impl: 2, robust: 2, mental: 10 }, "feature_typescript");
    expect(r.survives).toBe(true);
  });

  test("Rust (1.3x): Lv2 fails, Lv3 survives — highest in the tier", () => {
    expect(viability({ debug: 2, impl: 2, robust: 2, mental: 10 }, "feature_rust").survives).toBe(false);
    expect(viability({ debug: 3, impl: 3, robust: 3, mental: 10 }, "feature_rust").survives).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Webアプリ受託 variants — widest range: PHP Lv3, Rust Lv5
// ---------------------------------------------------------------------------

describe("Webアプリ受託 language variants: PHP Lv3, JS Lv4, Rust Lv5", () => {
  test("PHP (0.9x): Lv2 fails, Lv3 passes", () => {
    expect(viability({ debug: 2, impl: 2, robust: 2, mental: 10 }, "webapp_php").survives).toBe(false);
    expect(viability({ debug: 3, impl: 3, robust: 3, mental: 10 }, "webapp_php").survives).toBe(true);
  });

  test("JavaScript (1.0x): Lv3 fails (hpLost>100), Lv4 passes", () => {
    expect(viability({ debug: 3, impl: 3, robust: 3, mental: 10 }, "webapp_javascript").survives).toBe(false);
    expect(viability({ debug: 4, impl: 4, robust: 4, mental: 10 }, "webapp_javascript").survives).toBe(true);
  });

  test("TypeScript (1.1x): Lv4 fails, Lv5 passes", () => {
    expect(viability({ debug: 4, impl: 4, robust: 4, mental: 10 }, "webapp_typescript").survives).toBe(false);
    expect(viability({ debug: 5, impl: 5, robust: 5, mental: 10 }, "webapp_typescript").survives).toBe(true);
  });

  test("Rust (1.3x): Lv4 fails, Lv5 passes — same as TypeScript despite 1.3x mult", () => {
    expect(viability({ debug: 4, impl: 4, robust: 4, mental: 10 }, "webapp_rust").survives).toBe(false);
    expect(viability({ debug: 5, impl: 5, robust: 5, mental: 10 }, "webapp_rust").survives).toBe(true);
  });

  test("At Lv5: PHP hpLost < Rust hpLost (language difficulty ordering preserved)", () => {
    const php  = viability({ debug: 5, impl: 5, robust: 5, mental: 10 }, "webapp_php");
    const rust = viability({ debug: 5, impl: 5, robust: 5, mental: 10 }, "webapp_rust");
    expect(php.hpLostPerKill).toBeLessThan(rust.hpLostPerKill);
  });
});

// ---------------------------------------------------------------------------
// 緊急障害対応 variants — dot=1.5/s; Rust variant needs Lv13 vs Lv10 for PHP
// ---------------------------------------------------------------------------

describe("緊急障害対応 language variants: dot=1.5/s; PHP Lv10, Rust Lv13", () => {
  test("PHP (0.9x): Lv9 fails, Lv10 passes", () => {
    expect(viability({ debug: 9, impl: 9, robust: 9, mental: 10 }, "incident_php").survives).toBe(false);
    expect(viability({ debug: 10, impl: 10, robust: 10, mental: 10 }, "incident_php").survives).toBe(true);
  });

  test("JavaScript (1.0x): Lv9 fails, Lv10 passes (same threshold as PHP)", () => {
    expect(viability({ debug: 9, impl: 9, robust: 9, mental: 10 }, "incident_javascript").survives).toBe(false);
    expect(viability({ debug: 10, impl: 10, robust: 10, mental: 10 }, "incident_javascript").survives).toBe(true);
  });

  test("Go (1.15x): Lv11 fails, Lv12 passes", () => {
    expect(viability({ debug: 11, impl: 11, robust: 11, mental: 11 }, "incident_go").survives).toBe(false);
    expect(viability({ debug: 12, impl: 12, robust: 12, mental: 12 }, "incident_go").survives).toBe(true);
  });

  test("Rust (1.3x): Lv12 fails, Lv13 passes — +3 levels over PHP baseline", () => {
    expect(viability({ debug: 12, impl: 12, robust: 12, mental: 12 }, "incident_rust").survives).toBe(false);
    expect(viability({ debug: 13, impl: 13, robust: 13, mental: 13 }, "incident_rust").survives).toBe(true);
  });

  test("dot=1.5/s dominates: Rust incident is harder than Rust webapp (no dot)", () => {
    const incidentLv10 = viability({ debug: 10, impl: 10, robust: 10, mental: 10 }, "incident_rust");
    const webappLv10   = viability({ debug: 10, impl: 10, robust: 10, mental: 10 }, "webapp_rust");
    expect(incidentLv10.hpLostPerKill).toBeGreaterThan(webappLv10.hpLostPerKill);
  });
});

// ---------------------------------------------------------------------------
// TypeScript型エラー — def=16 hits hard at low levels
// ---------------------------------------------------------------------------

describe("TypeScript型エラー (hp:28 def:16 atk:10 maxHit:3 spd:2900ms)", () => {
  test("Lv1: cannot survive (high def=16 stretches kill time)", () => {
    const r = viability({ debug: 1, impl: 1, robust: 1, mental: 10 }, "ts_type_err");
    expect(r.survives).toBe(false);
    expect(r.hpLostPerKill).toBeGreaterThan(100);
  });

  test("Lv2: still fails — maxHit stuck at 1, hpLost≈111", () => {
    const r = viability({ debug: 2, impl: 2, robust: 2, mental: 10 }, "ts_type_err");
    expect(r.survives).toBe(false);
  });

  test("Lv3: first safe level (hpLost≈53/100)", () => {
    const r = viability({ debug: 3, impl: 3, robust: 3, mental: 10 }, "ts_type_err");
    expect(r.survives).toBe(true);
    expect(r.hpLostPerKill).toBeLessThan(60);
  });

  test("def=16 suppresses hitChance — DPS vs ts_type_err < vs bugfix_javascript at Lv1", () => {
    const vsTs  = viability({ debug: 1 }, "ts_type_err");
    const vsBug = viability({ debug: 1 }, "bugfix_javascript");
    expect(vsTs.playerDps).toBeLessThan(vsBug.playerDps);
  });
});

// ---------------------------------------------------------------------------
// Pythonメモリリーク — regen=0.8; maxHit jump at Lv13 unlocks the kill
// ---------------------------------------------------------------------------

describe("Pythonメモリリーク (hp:38 def:8 atk:12 maxHit:4 spd:2800ms regen:0.8/s)", () => {
  test("Lv1: DPS far below regen 0.8", () => {
    const r = viability({ debug: 1, impl: 1, robust: 1, mental: 10 }, "py_memleak");
    expect(r.canKill).toBe(false);
    expect(r.playerDps).toBeLessThan(0.2);
  });

  test("Lv12: maxHit=5, DPS=0.765 — still blocked by regen 0.8", () => {
    const r = viability({ debug: 12, impl: 12, robust: 12, mental: 12 }, "py_memleak");
    expect(r.canKill).toBe(false);
    expect(r.playerDps).toBeLessThan(0.8);
  });

  test("Lv13: maxHit jumps to 6 → DPS=0.907 > 0.8 → can kill and survives", () => {
    const r = viability({ debug: 13, impl: 13, robust: 13, mental: 13 }, "py_memleak");
    expect(r.canKill).toBe(true);
    expect(r.playerDps).toBeGreaterThan(0.8);
    expect(r.survives).toBe(true);
  });

  test("low debug suppresses hitChance: debug=5, impl=12 → DPS<0.8 (cannot kill)", () => {
    const r = viability({ debug: 5, impl: 12, robust: 5, mental: 12 }, "py_memleak");
    expect(r.canKill).toBe(false);
    expect(r.playerDps).toBeLessThan(0.8);
  });
});

// ---------------------------------------------------------------------------
// Goroutineリーク — regen=1.0; Lv19 DPS exactly = regen (strict boundary)
// ---------------------------------------------------------------------------

describe("Goroutineリーク (hp:45 def:20 atk:14 maxHit:4 spd:3000ms regen:1.0/s)", () => {
  test("Lv1: trivially unkillable", () => {
    expect(viability({ debug: 1, impl: 1, robust: 1, mental: 10 }, "go_goroutine").canKill).toBe(false);
  });

  test("Lv19: DPS exactly 1.0 = regen → canKill=false (strict >)", () => {
    const r = viability({ debug: 19, impl: 19, robust: 19, mental: 19 }, "go_goroutine");
    expect(r.canKill).toBe(false);
    expect(r.playerDps).toBeCloseTo(1.0, 2);
  });

  test("Lv20: maxHit jumps to 9 → DPS>1.0, survives (hpLost≈69/200)", () => {
    const r = viability({ debug: 20, impl: 20, robust: 20, mental: 20 }, "go_goroutine");
    expect(r.canKill).toBe(true);
    expect(r.playerDps).toBeGreaterThan(1.0);
    expect(r.survives).toBe(true);
  });

  test("Goroutineリーク harder than incident_go despite no dot (regen=1.0 vs dot=1.5)", () => {
    // incident_go (minLv=12) vs go_goroutine (minLv=20) — regen is harder than dot here
    expect(findMinBalancedLevel("go_goroutine")).toBeGreaterThan(findMinBalancedLevel("incident_go"));
  });
});

// ---------------------------------------------------------------------------
// Rust所有権エラー — def=35 (highest in the game)
// ---------------------------------------------------------------------------

describe("Rust所有権エラー (hp:30 def:35 atk:15 maxHit:4 spd:2800ms)", () => {
  test("Lv1: def=35 kills hitChance (hpLost≫100)", () => {
    const r = viability({ debug: 1, impl: 1, robust: 1, mental: 10 }, "rust_compile");
    expect(r.survives).toBe(false);
    expect(r.hpLostPerKill).toBeGreaterThan(300);
  });

  test("Lv4: fails — maxHit=2, kill too slow", () => {
    expect(viability({ debug: 4, impl: 4, robust: 4, mental: 10 }, "rust_compile").survives).toBe(false);
  });

  test("Lv5: first safe level (maxHit=3; hpLost≈79/100)", () => {
    const r = viability({ debug: 5, impl: 5, robust: 5, mental: 10 }, "rust_compile");
    expect(r.survives).toBe(true);
    expect(r.hpLostPerKill).toBeLessThan(90);
  });

  test("def=35 highest in game — lower hitChance than webapp_rust (def:16) at same level", () => {
    const rRust = viability({ debug: 10 }, "rust_compile");
    const rWeb  = viability({ debug: 10 }, "webapp_rust");
    expect(rRust.playerDps).toBeLessThan(rWeb.playerDps);
  });
});

// ---------------------------------------------------------------------------
// SQL N+1問題 — regen=1.2; Lv19 exact boundary
// ---------------------------------------------------------------------------

describe("SQL N+1問題 (hp:35 def:10 atk:18 maxHit:5 spd:2400ms regen:1.2/s)", () => {
  test("Lv1: DPS far below regen 1.2", () => {
    expect(viability({ debug: 1 }, "sql_n1").canKill).toBe(false);
  });

  test("Lv19: DPS exactly 1.2 = regen → canKill=false (strict >)", () => {
    const r = viability({ debug: 19, impl: 19, robust: 19, mental: 19 }, "sql_n1");
    expect(r.canKill).toBe(false);
    expect(r.playerDps).toBeCloseTo(1.2, 2);
  });

  test("Lv20: DPS=1.346 > 1.2 → can kill and survives", () => {
    const r = viability({ debug: 20, impl: 20, robust: 20, mental: 20 }, "sql_n1");
    expect(r.canKill).toBe(true);
    expect(r.survives).toBe(true);
  });

  test("sql_n1 regen=1.2 same as spec_change variants but harder (def:10 vs def:5)", () => {
    // Both need Lv18-20 to overcome regen, but sql_n1 hits harder (atk:18 vs atk:6)
    const sql  = viability({ debug: 20, impl: 20, robust: 20, mental: 20 }, "sql_n1");
    const spec = viability({ debug: 20, impl: 20, robust: 20, mental: 20 }, "spec_change_javascript");
    expect(sql.hpLostPerKill).toBeGreaterThan(spec.hpLostPerKill);
  });
});

// ---------------------------------------------------------------------------
// 炎上案件 — dot=3.0/s; Lv21 razor-thin miss, Lv22 first clear
// ---------------------------------------------------------------------------

describe("炎上案件 (hp:65 def:18 atk:28 maxHit:8 spd:2000ms dot:3.0/s)", () => {
  test("Lv1: dot alone makes kill time fatal (hpLost≫1000)", () => {
    const r = viability({ debug: 1, impl: 1, robust: 1, mental: 10 }, "enjou");
    expect(r.survives).toBe(false);
    expect(r.hpLostPerKill).toBeGreaterThan(1000);
  });

  test("Lv10: still fatal — dot dominates (hpLost≫maxHp)", () => {
    const r = viability({ debug: 10, impl: 10, robust: 10, mental: 10 }, "enjou");
    expect(r.survives).toBe(false);
    expect(r.hpLostPerKill).toBeGreaterThan(r.maxHp);
  });

  test("Lv21: razor-thin miss (hpLost≈211 > maxHp=210 — within 1 HP)", () => {
    const r = viability({ debug: 21, impl: 21, robust: 21, mental: 21 }, "enjou");
    expect(r.survives).toBe(false);
    expect(r.hpLostPerKill).toBeGreaterThan(r.maxHp);
    expect(r.hpLostPerKill).toBeLessThan(r.maxHp + 5);
  });

  test("Lv22: first viable level", () => {
    expect(viability({ debug: 22, impl: 22, robust: 22, mental: 22 }, "enjou").survives).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 技術的負債解消 — dot=1.0 + high defence=22
// ---------------------------------------------------------------------------

describe("技術的負債解消 (hp:45 def:22 atk:14 maxHit:4 spd:3000ms dot:1.0/s)", () => {
  test("Lv1: fatal (dot + slow kill)", () => {
    expect(viability({ debug: 1 }, "techdebt").survives).toBe(false);
  });

  test("Lv11: just fails (hpLost≈110.9 > maxHp=110)", () => {
    const r = viability({ debug: 11, impl: 11, robust: 11, mental: 11 }, "techdebt");
    expect(r.canKill).toBe(true);
    expect(r.survives).toBe(false);
  });

  test("Lv12: first viable (hpLost<120)", () => {
    expect(viability({ debug: 12, impl: 12, robust: 12, mental: 12 }, "techdebt").survives).toBe(true);
  });

  test("impl (faster kill) reduces dot exposure more than robust", () => {
    const moreImpl  = viability({ debug: 12, impl: 20, robust: 12, mental: 12 }, "techdebt");
    const moreRobust = viability({ debug: 12, impl: 12, robust: 20, mental: 12 }, "techdebt");
    expect(moreImpl.hpLostPerKill).toBeLessThan(moreRobust.hpLostPerKill);
  });
});

// ---------------------------------------------------------------------------
// 新規PJT立ち上げ — regen=0.65; Lv12 DPS exactly = regen
// ---------------------------------------------------------------------------

describe("新規PJT立ち上げ (hp:58 def:14 atk:18 maxHit:5 spd:2600ms regen:0.65/s)", () => {
  test("Lv12: DPS exactly 0.65 = regen → canKill=false", () => {
    const r = viability({ debug: 12, impl: 12, robust: 12, mental: 12 }, "newproject");
    expect(r.canKill).toBe(false);
    expect(r.playerDps).toBeCloseTo(0.65, 3);
  });

  test("Lv14: canKill=true but hpLost>maxHp (kill too slow)", () => {
    const r = viability({ debug: 14, impl: 14, robust: 14, mental: 14 }, "newproject");
    expect(r.canKill).toBe(true);
    expect(r.survives).toBe(false);
  });

  test("Lv15: first safe level", () => {
    expect(viability({ debug: 15, impl: 15, robust: 15, mental: 15 }, "newproject").survives).toBe(true);
  });

  test("more mental (HP) alone doesn't help if canKill=false", () => {
    const r = viability({ debug: 12, impl: 12, robust: 12, mental: 30 }, "newproject");
    expect(r.canKill).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// パフォーマンス障害 — regen=1.5/s; Lv24 last loser, Lv25 first win
// ---------------------------------------------------------------------------

describe("パフォーマンス障害 (hp:50 def:12 atk:22 maxHit:6 spd:2200ms regen:1.5/s)", () => {
  test("Lv1: unkillable (DPS ≪ 1.5)", () => {
    expect(viability({ debug: 1 }, "perf_issue").canKill).toBe(false);
  });

  test("Lv24: DPS≈1.479 < 1.5 → still cannot kill", () => {
    const r = viability({ debug: 24, impl: 24, robust: 24, mental: 24 }, "perf_issue");
    expect(r.canKill).toBe(false);
    expect(r.playerDps).toBeLessThan(1.5);
  });

  test("Lv25: DPS>1.5 → can kill and survives", () => {
    const r = viability({ debug: 25, impl: 25, robust: 25, mental: 25 }, "perf_issue");
    expect(r.canKill).toBe(true);
    expect(r.survives).toBe(true);
  });

  test("pure impl=25 at debug=1 cannot break regen (hitChance too low)", () => {
    expect(viability({ debug: 1, impl: 25, robust: 1, mental: 25 }, "perf_issue").canKill).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// システム移行 — regen=2.0/s; Lv34 last loser, Lv35 first win
// ---------------------------------------------------------------------------

describe("システム移行 (hp:80 def:18 atk:20 maxHit:6 spd:3400ms regen:2.0/s)", () => {
  test("Lv1: unkillable (playerDps < 0.1)", () => {
    const r = viability({ debug: 1 }, "migration");
    expect(r.canKill).toBe(false);
    expect(r.playerDps).toBeLessThan(0.1);
  });

  test("Lv34: DPS≈1.989 < 2.0 → last losing level", () => {
    expect(viability({ debug: 34, impl: 34, robust: 34, mental: 34 }, "migration").canKill).toBe(false);
  });

  test("Lv35: DPS>2.0 → first victory, survives (<40% HP lost)", () => {
    const r = viability({ debug: 35, impl: 35, robust: 35, mental: 35 }, "migration");
    expect(r.canKill).toBe(true);
    expect(r.survives).toBe(true);
    expect(r.hpLostPerKill).toBeLessThan(r.maxHp * 0.4);
  });

  test("Lv30: canKill=true but cannot survive (netDps tiny, kill takes forever)", () => {
    const r = viability({ debug: 30, impl: 30, robust: 30, mental: 30 }, "migration");
    expect(r.canKill).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting: language difficulty ordering
// ---------------------------------------------------------------------------

describe("cross-cutting: language difficulty ordering", () => {
  test("feature: PHP DPS > Rust DPS at same level (easier to hit PHP)", () => {
    const php  = viability({ debug: 5, impl: 5, robust: 5, mental: 10 }, "feature_php");
    const rust = viability({ debug: 5, impl: 5, robust: 5, mental: 10 }, "feature_rust");
    expect(php.playerDps).toBeGreaterThan(rust.playerDps);
  });

  test("incident: PHP hpLostPerKill < Rust at Lv15 (language mult affects enemy damage and kill time)", () => {
    const php  = viability({ debug: 15, impl: 15, robust: 15, mental: 15 }, "incident_php");
    const rust = viability({ debug: 15, impl: 15, robust: 15, mental: 15 }, "incident_rust");
    expect(php.hpLostPerKill).toBeLessThan(rust.hpLostPerKill);
  });

  test("spec_change: regen monsters are language-independent in minLv", () => {
    // All spec_change variants need exactly Lv18 — regen is the only gating factor
    expect(findMinBalancedLevel("spec_change_php")).toBe(findMinBalancedLevel("spec_change_rust"));
  });
});

// ---------------------------------------------------------------------------
// MONSTERS completeness
// ---------------------------------------------------------------------------

describe("MONSTERS completeness", () => {
  test("every monster in MONSTERS array can be looked up via MONSTER_MAP", () => {
    for (const m of MONSTERS) {
      expect(MONSTER_MAP[m.id], `MONSTER_MAP missing: ${m.id}`).toBeDefined();
    }
  });

  test("viability can be computed for all monsters without crashing", () => {
    for (const m of MONSTERS) {
      expect(() =>
        viability({ debug: 20, impl: 20, robust: 20, mental: 20 }, m.id),
      ).not.toThrow();
    }
  });

  test("at Lv40 balanced, all monsters can be defeated", () => {
    for (const m of MONSTERS) {
      const r = viability({ debug: 40, impl: 40, robust: 40, mental: 40 }, m.id);
      expect(r.survives, `Lv40 cannot defeat ${m.id}`).toBe(true);
    }
  });

  test("all language-variant monsters have weakTo and xpAlso set", () => {
    const langVariants = MONSTERS.filter(m => m.id.includes("_") && !["ts_type_err", "py_memleak", "go_goroutine", "rust_compile", "sql_n1"].includes(m.id) && !["techdebt", "newproject", "perf_issue", "migration", "enjou"].includes(m.id));
    for (const m of langVariants) {
      expect(m.weakTo, `${m.id} missing weakTo`).toBeDefined();
      expect(m.xpAlso, `${m.id} missing xpAlso`).toBeDefined();
    }
  });
});

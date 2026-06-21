import { describe, expect, test } from "vitest";
import {
  getCombatStats,
  playerHitChance,
  enemyHitChance,
  avgPlayerDamage,
  avgEnemyDamage,
} from "@/lib/combat";
import { xpForLevel } from "@/lib/xp";
import { freshState, withSkills } from "./helpers";
import type { Monster } from "@/types/monsters";

// A minimal monster for formula testing
const DUMMY_MONSTER: Monster = {
  id: "test",
  name: "テスト",
  icon: "bug_m",
  hp: 10,
  maxHit: 2,
  attack: 10,
  defence: 10,
  speed: 3000,
  xp: 20,
  goldMin: 5,
  goldMax: 10,
  loot: [],
};

describe("getCombatStats", () => {
  test("all skills at Lv1 gives baseline stats", () => {
    const stats = getCombatStats(freshState());
    // maxHit = floor((1 + 1*0.4) * 1) = 1
    expect(stats.maxHit).toBe(1);
    // attackRating = round((2 + 1*2) * 1) = 4
    expect(stats.attackRating).toBe(4);
    // defenceRating = round((5 + 1*2) * 1) = 7
    expect(stats.defenceRating).toBe(7);
    // weaponSpeed = round(3000 / 1) = 3000
    expect(stats.weaponSpeed).toBe(3000);
  });

  test("mental Lv10 → maxHp=100", () => {
    const s = withSkills({ mental: 10 });
    const stats = getCombatStats(s);
    expect(stats.maxHp).toBe(100); // 10 * 10 * 1
  });

  test("defence Lv20 increases defenceRating", () => {
    const base = getCombatStats(freshState());
    const strong = getCombatStats(withSkills({ robust: 20 }));
    expect(strong.defenceRating).toBeGreaterThan(base.defenceRating);
  });

  test("attack Lv30 increases attackRating", () => {
    const base = getCombatStats(freshState());
    const strong = getCombatStats(withSkills({ debug: 30 }));
    expect(strong.attackRating).toBeGreaterThan(base.attackRating);
  });

  test("strength Lv30 increases maxHit", () => {
    const base = getCombatStats(freshState());
    const strong = getCombatStats(withSkills({ impl: 30 }));
    expect(strong.maxHit).toBeGreaterThan(base.maxHit);
  });
});

describe("playerHitChance", () => {
  test("symmetric case → 0.5", () => {
    const stats = getCombatStats(freshState());
    // attackRating=4, defence=4 → 4/(4+4) = 0.5
    const monster = { ...DUMMY_MONSTER, defence: stats.attackRating };
    expect(playerHitChance(stats, monster)).toBeCloseTo(0.5);
  });

  test("higher attackRating vs same defence → closer to 1", () => {
    const weak = getCombatStats(withSkills({ debug: 1 }));
    const strong = getCombatStats(withSkills({ debug: 50 }));
    expect(playerHitChance(strong, DUMMY_MONSTER)).toBeGreaterThan(
      playerHitChance(weak, DUMMY_MONSTER),
    );
  });

  test("result is between 0 and 1", () => {
    const stats = getCombatStats(freshState());
    const p = playerHitChance(stats, DUMMY_MONSTER);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThanOrEqual(1);
  });
});

describe("enemyHitChance", () => {
  test("symmetric case → 0.5", () => {
    const stats = getCombatStats(freshState());
    // defenceRating=7, attack=7 → 7/(7+7) = 0.5
    const monster = { ...DUMMY_MONSTER, attack: stats.defenceRating };
    expect(enemyHitChance(stats, monster)).toBeCloseTo(0.5);
  });

  test("higher player defenceRating reduces enemy hit chance", () => {
    const weak = getCombatStats(withSkills({ robust: 1 }));
    const tanky = getCombatStats(withSkills({ robust: 50 }));
    expect(enemyHitChance(tanky, DUMMY_MONSTER)).toBeLessThan(
      enemyHitChance(weak, DUMMY_MONSTER),
    );
  });
});

describe("avgPlayerDamage / avgEnemyDamage", () => {
  test("avgPlayerDamage = hitChance × (1+maxHit)/2", () => {
    const stats = getCombatStats(freshState());
    const chance = playerHitChance(stats, DUMMY_MONSTER);
    const expected = chance * ((1 + stats.maxHit) / 2);
    expect(avgPlayerDamage(stats, DUMMY_MONSTER)).toBeCloseTo(expected);
  });

  test("avgEnemyDamage = hitChance × (1+monster.maxHit)/2", () => {
    const stats = getCombatStats(freshState());
    const chance = enemyHitChance(stats, DUMMY_MONSTER);
    const expected = chance * ((1 + DUMMY_MONSTER.maxHit) / 2);
    expect(avgEnemyDamage(stats, DUMMY_MONSTER)).toBeCloseTo(expected);
  });

  test("stronger player → higher avgPlayerDamage", () => {
    const weak = getCombatStats(withSkills({ debug: 1, impl: 1 }));
    const strong = getCombatStats(withSkills({ debug: 50, impl: 50 }));
    expect(avgPlayerDamage(strong, DUMMY_MONSTER)).toBeGreaterThan(
      avgPlayerDamage(weak, DUMMY_MONSTER),
    );
  });
});

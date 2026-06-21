import { describe, expect, test } from "vitest";
import { xpForLevel, levelForXp, levelProgress, MAX_LEVEL } from "@/lib/xp";

describe("xpForLevel", () => {
  test("Lv1 = 0", () => {
    expect(xpForLevel(1)).toBe(0);
  });

  test("Lv2 = 83", () => {
    // cumulativeXp(2) = floor((1 + 300×2^(1/7)) / 4) = floor(332/4) = 83
    expect(xpForLevel(2)).toBe(83);
  });

  test("Lv99 = 13,034,431", () => {
    expect(xpForLevel(99)).toBe(13_034_431);
  });

  test("clamps inputs below 1 to Lv1", () => {
    expect(xpForLevel(0)).toBe(xpForLevel(1));
    expect(xpForLevel(-99)).toBe(xpForLevel(1));
  });

  test("clamps inputs above MAX_LEVEL to Lv99", () => {
    expect(xpForLevel(100)).toBe(xpForLevel(MAX_LEVEL));
    expect(xpForLevel(9999)).toBe(xpForLevel(MAX_LEVEL));
  });

  test("strictly increasing from Lv1 to Lv99", () => {
    for (let l = 2; l <= MAX_LEVEL; l++) {
      expect(xpForLevel(l)).toBeGreaterThan(xpForLevel(l - 1));
    }
  });
});

describe("levelForXp", () => {
  test("0 xp → Lv1", () => {
    expect(levelForXp(0)).toBe(1);
  });

  test("negative xp → Lv1", () => {
    expect(levelForXp(-100)).toBe(1);
  });

  test("round-trips with xpForLevel", () => {
    for (const lv of [2, 5, 20, 50, 80, 99]) {
      expect(levelForXp(xpForLevel(lv))).toBe(lv);
    }
  });

  test("1 xp below threshold stays at lower level", () => {
    for (const lv of [10, 30, 70]) {
      expect(levelForXp(xpForLevel(lv) - 1)).toBe(lv - 1);
    }
  });

  test("huge xp → Lv99", () => {
    expect(levelForXp(999_999_999)).toBe(99);
  });

  test("monotonically non-decreasing", () => {
    let prev = 1;
    for (let xp = 0; xp <= 200_000; xp += 1000) {
      const cur = levelForXp(xp);
      expect(cur).toBeGreaterThanOrEqual(prev);
      prev = cur;
    }
  });
});

describe("levelProgress", () => {
  test("0 xp → 0 progress", () => {
    expect(levelProgress(0)).toBe(0);
  });

  test("exactly at level boundary → 0", () => {
    expect(levelProgress(xpForLevel(30))).toBe(0);
    expect(levelProgress(xpForLevel(50))).toBe(0);
  });

  test("at Lv99 threshold → 1 (capped)", () => {
    expect(levelProgress(xpForLevel(99))).toBe(1);
    expect(levelProgress(999_999_999)).toBe(1);
  });

  test("midpoint between Lv50 and Lv51: 0 < progress < 1", () => {
    const mid = Math.floor((xpForLevel(50) + xpForLevel(51)) / 2);
    const p = levelProgress(mid);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
  });

  test("progress is roughly 0.5 at midpoint", () => {
    const mid = Math.floor((xpForLevel(10) + xpForLevel(11)) / 2);
    const p = levelProgress(mid);
    expect(p).toBeCloseTo(0.5, 1);
  });
});

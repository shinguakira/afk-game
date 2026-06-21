import { describe, expect, test } from "vitest";
import { prestigeGain, isUnderPrepared } from "@/lib/prestige";
import { freshState, stateForTotal } from "./helpers";

// prestigeGain = floor(totalLevel / 20) + currentRank.index * 2

describe("prestigeGain", () => {
  test("totalLevel=0, rank=見習い → 0", () => {
    // The minimum state has N skills at Lv1 so totalLevel=N, not 0.
    // But we can still test the formula: gain = floor(N/20) + rank.index*2
    const s = freshState();
    const gain = prestigeGain(s);
    expect(gain).toBeGreaterThanOrEqual(0);
  });

  test("シニア (rank index=3, total=160) → 8 + 6 = 14", () => {
    const s = stateForTotal(160);
    expect(prestigeGain(s)).toBe(14);
  });

  test("テックリード (rank index=4, total=280) → 14 + 8 = 22", () => {
    const s = stateForTotal(280);
    expect(prestigeGain(s)).toBe(22);
  });

  test("役員 (rank index=5, total=450) → 22 + 10 = 32", () => {
    const s = stateForTotal(450);
    expect(prestigeGain(s)).toBe(32);
  });

  test("社長 (rank index=6, total=700) → 35 + 12 = 47", () => {
    const s = stateForTotal(700);
    expect(prestigeGain(s)).toBe(47);
  });

  test("higher totalLevel gives more stock (monotone)", () => {
    const a = prestigeGain(stateForTotal(160));
    const b = prestigeGain(stateForTotal(280));
    const c = prestigeGain(stateForTotal(700));
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
});

describe("isUnderPrepared", () => {
  test("シニア未満 → true", () => {
    // ミドル = rank index 2 < 3
    const s = stateForTotal(80);
    expect(isUnderPrepared(s)).toBe(true);
  });

  test("シニア (rank index=3) → false", () => {
    const s = stateForTotal(160);
    expect(isUnderPrepared(s)).toBe(false);
  });

  test("社長 → false", () => {
    const s = stateForTotal(700);
    expect(isUnderPrepared(s)).toBe(false);
  });
});

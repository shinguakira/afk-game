import { describe, expect, test } from "vitest";
import { actionTiming, plotGrowthRate } from "@/lib/timing";
import { shopPrice } from "@/lib/economy";
import { ACTION_MAP } from "@/constants/maps";
import { TEND_BOOST } from "@/constants/farming";
import { SHOP_MARKUP } from "@/constants/config";
import { freshState } from "./helpers";

describe("actionTiming", () => {
  test("gather action (no inputs): isCraft=false, effTime=action.time, xpPer=action.xp", () => {
    const action = ACTION_MAP["code_js"]!;
    const t = actionTiming(action, {});
    expect(t.isCraft).toBe(false);
    expect(t.effTime).toBe(action.time);
    expect(t.xpPer).toBe(action.xp);
  });

  test("craft action (has inputs): isCraft=true", () => {
    const action = ACTION_MAP["cook_onigiri"]!;
    const t = actionTiming(action, {});
    expect(t.isCraft).toBe(true);
    expect(t.effTime).toBe(action.time);
    expect(t.xpPer).toBe(action.xp);
  });

  test("speed.gather +100% halves gather effTime", () => {
    const action = ACTION_MAP["code_js"]!;
    const t = actionTiming(action, { "speed.gather": 2 });
    expect(t.effTime).toBeCloseTo(action.time / 2);
  });

  test("speed.craft +100% halves craft effTime", () => {
    const action = ACTION_MAP["cook_onigiri"]!;
    const t = actionTiming(action, { "speed.craft": 2 });
    expect(t.effTime).toBeCloseTo(action.time / 2);
  });

  test("xp.gather +50% increases xpPer by 50%", () => {
    const action = ACTION_MAP["code_js"]!;
    const t = actionTiming(action, { "xp.gather": 1.5 });
    expect(t.xpPer).toBeCloseTo(action.xp * 1.5);
  });

  test("speed modifier on wrong category has no effect", () => {
    const gather = ACTION_MAP["code_js"]!;
    // speed.craft boost should not affect gather action
    const withCraftBoost = actionTiming(gather, { "speed.craft": 2 });
    const baseline = actionTiming(gather, {});
    expect(withCraftBoost.effTime).toBe(baseline.effTime);
  });
});

describe("plotGrowthRate", () => {
  test("no active action → rate = 1", () => {
    const s = freshState({ active: null });
    expect(plotGrowthRate(s)).toBe(1);
  });

  test("combat active → rate = 1", () => {
    const s = freshState({ active: { kind: "combat", monsterId: "bugfix" } });
    expect(plotGrowthRate(s)).toBe(1);
  });

  test("non-farming skill active → rate = 1", () => {
    const s = freshState({ active: { kind: "skill", actionId: "code_js" } });
    expect(plotGrowthRate(s)).toBe(1);
  });

  test("farming tend action active → rate = TEND_BOOST (2.5)", () => {
    const s = freshState({ active: { kind: "skill", actionId: "farm_till" } });
    expect(plotGrowthRate(s)).toBe(TEND_BOOST);
  });

  test("farm_water also triggers TEND_BOOST", () => {
    const s = freshState({ active: { kind: "skill", actionId: "farm_water" } });
    expect(plotGrowthRate(s)).toBe(TEND_BOOST);
  });
});

describe("shopPrice", () => {
  test("normal price × SHOP_MARKUP (×2)", () => {
    expect(shopPrice(100)).toBe(200);
    expect(shopPrice(50)).toBe(100);
  });

  test("rounds to nearest integer", () => {
    expect(shopPrice(3)).toBe(6); // 3 * 2 = 6
    expect(shopPrice(1)).toBe(2);
  });

  test("floor at 1 — never returns 0", () => {
    expect(shopPrice(0)).toBe(1);
    expect(shopPrice(0.1)).toBe(1); // round(0.1 * 2) = round(0.2) = 0 → clamped to 1
  });

  test("fractional sell price rounds correctly", () => {
    // sellPrice=5, SHOP_MARKUP=2 → round(10) = 10
    expect(shopPrice(5)).toBe(5 * SHOP_MARKUP);
  });
});

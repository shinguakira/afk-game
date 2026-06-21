import { describe, expect, test, vi } from "vitest";
import { runSkillTick, advancePlots } from "@/lib/tick";
import { FARM_CROP_MAP, TEND_BOOST } from "@/constants/farming";
import { ACTION_MAP } from "@/constants/maps";
import { freshState, mockStore } from "./helpers";

describe("advancePlots", () => {
  test("no plots → no-op", () => {
    const { get, set } = mockStore({ plots: [] });
    advancePlots(set, get, 1000);
    expect(get().plots).toEqual([]);
  });

  test("empty plot (no crop) → unchanged", () => {
    const { get, set } = mockStore({ plots: [{ crop: null, growth: 0 }] });
    advancePlots(set, get, 5000);
    expect(get().plots[0].growth).toBe(0);
  });

  test("crop grows by dt when rate=1 (non-farming active)", () => {
    const { get, set } = mockStore({
      active: { kind: "combat", monsterId: "bugfix" },
      plots: [{ crop: "tomato", growth: 0 }],
    });
    advancePlots(set, get, 10_000);
    expect(get().plots[0].growth).toBe(10_000);
  });

  test("growth is capped at growMs", () => {
    const growMs = FARM_CROP_MAP["tomato"].growMs;
    const { get, set } = mockStore({
      plots: [{ crop: "tomato", growth: growMs - 100 }],
    });
    advancePlots(set, get, 5_000);
    expect(get().plots[0].growth).toBe(growMs);
  });

  test("farming active → TEND_BOOST multiplier on growth", () => {
    const { get, set } = mockStore({
      active: { kind: "skill", actionId: "farm_till" },
      plots: [{ crop: "tomato", growth: 0 }],
    });
    advancePlots(set, get, 1_000);
    expect(get().plots[0].growth).toBe(1_000 * TEND_BOOST);
  });

  test("multiple plots all advance independently", () => {
    const { get, set } = mockStore({
      plots: [
        { crop: "tomato", growth: 0 },
        { crop: "carrot", growth: 500 },
        { crop: null, growth: 0 },
      ],
    });
    advancePlots(set, get, 1_000);
    expect(get().plots[0].growth).toBe(1_000);
    expect(get().plots[1].growth).toBe(1_500);
    expect(get().plots[2].growth).toBe(0); // no crop
  });
});

describe("runSkillTick", () => {
  test("no active → no changes", () => {
    const { get, set } = mockStore({ active: null, bank: {} });
    runSkillTick(set, get, 5_000);
    expect(get().bank).toEqual({});
    expect(get().active).toBeNull();
  });

  test("unknown actionId → clears active", () => {
    const { get, set } = mockStore({
      active: { kind: "skill", actionId: "nonexistent_action_xyz" },
    });
    runSkillTick(set, get, 100);
    expect(get().active).toBeNull();
  });

  test("code_js for exactly 3000ms → 1 commit, +15 js xp", () => {
    const action = ACTION_MAP["code_js"]!;
    const { get, set } = mockStore({
      active: { kind: "skill", actionId: "code_js" },
      skills: { js: { xp: 0 } },
    });
    runSkillTick(set, get, action.time); // exactly 1 completion
    expect(get().bank.commit).toBe(1);
    expect(get().skills.js?.xp).toBe(action.xp);
  });

  test("code_js for 9000ms → 3 completions, +3 commits", () => {
    const action = ACTION_MAP["code_js"]!;
    const { get, set } = mockStore({
      active: { kind: "skill", actionId: "code_js" },
      skills: { js: { xp: 0 } },
    });
    runSkillTick(set, get, action.time * 3);
    expect(get().bank.commit).toBe(3);
    expect(get().skills.js?.xp).toBe(action.xp * 3);
  });

  test("craft action stops and clears active when inputs exhausted", () => {
    const { get, set } = mockStore({
      active: { kind: "skill", actionId: "cook_onigiri" },
      bank: { rice: 2 }, // enough for exactly 1 onigiri (needs 2 rice)
      skills: { cooking: { xp: 0 } },
    });
    runSkillTick(set, get, 10_000); // ample time
    expect(get().bank.onigiri).toBe(1);
    expect(get().active).toBeNull(); // stopped
  });

  test("gather action accumulates actionProgress across short ticks", () => {
    const action = ACTION_MAP["code_js"]!;
    const { get, set } = mockStore({
      active: { kind: "skill", actionId: "code_js" },
      actionProgress: 0,
    });
    // Two ticks each less than action.time → no completion yet
    runSkillTick(set, get, action.time * 0.4);
    expect(get().bank.commit ?? 0).toBe(0);
    runSkillTick(set, get, action.time * 0.4);
    expect(get().bank.commit ?? 0).toBe(0);
    // Third tick pushes past action.time (total 0.8+0.8=1.2× > 1×)
    runSkillTick(set, get, action.time * 0.4);
    expect(get().bank.commit ?? 0).toBe(1);
  });
});

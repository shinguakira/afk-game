import { describe, expect, test } from "vitest";
import { MILESTONES } from "@/lib/roadmap";
import { xpForLevel } from "@/lib/xp";
import { freshState, withSkills } from "./helpers";

function milestone(id: string) {
  const m = MILESTONES.find((m) => m.id === id);
  if (!m) throw new Error(`milestone not found: ${id}`);
  return m;
}

describe("first_commit (maxLangLevel >= 2)", () => {
  test("js at Lv2 → true", () => {
    expect(milestone("first_commit").check(withSkills({ js: 2 }))).toBe(true);
  });

  test("js at Lv1 → false", () => {
    expect(milestone("first_commit").check(withSkills({ js: 1 }))).toBe(false);
  });

  test("no language skills → false", () => {
    expect(milestone("first_commit").check(freshState())).toBe(false);
  });
});

describe("first_framework (maxLangLevel >= 5)", () => {
  test("js at Lv5 → true", () => {
    expect(milestone("first_framework").check(withSkills({ js: 5 }))).toBe(true);
  });

  test("js at Lv4 → false", () => {
    expect(milestone("first_framework").check(withSkills({ js: 4 }))).toBe(false);
  });

  test("multiple langs all at Lv3 → false (none at 5)", () => {
    expect(
      milestone("first_framework").check(withSkills({ js: 3, ts: 3, python: 3 })),
    ).toBe(false);
  });
});

describe("savings_1k (gold >= 1000)", () => {
  test("gold=1000 → true", () => {
    expect(milestone("savings_1k").check(freshState({ gold: 1000 }))).toBe(true);
  });

  test("gold=999 → false", () => {
    expect(milestone("savings_1k").check(freshState({ gold: 999 }))).toBe(false);
  });

  test("gold=0 → false", () => {
    expect(milestone("savings_1k").check(freshState({ gold: 0 }))).toBe(false);
  });
});

describe("first_device (equipment.weapon exists)", () => {
  test("weapon equipped → true", () => {
    expect(
      milestone("first_device").check(freshState({ equipment: { weapon: "keyboard" } })),
    ).toBe(true);
  });

  test("no weapon → false", () => {
    expect(milestone("first_device").check(freshState({ equipment: {} }))).toBe(false);
  });
});

describe("first_class (jobClass set and not 'none')", () => {
  test("jobClass='sre' → true", () => {
    expect(milestone("first_class").check(freshState({ jobClass: "sre" }))).toBe(true);
  });

  test("jobClass=null → false", () => {
    expect(milestone("first_class").check(freshState({ jobClass: null }))).toBe(false);
  });
});

describe("MILESTONES ordering", () => {
  test("all milestone ids are unique", () => {
    const ids = MILESTONES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("all milestones have check function", () => {
    for (const m of MILESTONES) {
      expect(typeof m.check).toBe("function");
    }
  });

  test("first_commit check is false for a totally fresh state", () => {
    // fresh state has no lang skills → maxLangLevel = 0
    const s = freshState({ skills: {} });
    expect(milestone("first_commit").check(s)).toBe(false);
  });
});

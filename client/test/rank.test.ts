import { describe, expect, test } from "vitest";
import { totalLevel, currentRank, nextRank, RANKS } from "@/lib/rank";
import { SKILLS } from "@/constants/skills";
import { freshState, withSkills, stateForTotal } from "./helpers";

const N = SKILLS.length;

describe("totalLevel", () => {
  test("empty skills map → all SKILLS default to Lv1 → N total", () => {
    expect(totalLevel(freshState())).toBe(N);
  });

  test("single skill at Lv10 adds 9 above baseline", () => {
    const s = withSkills({ js: 10 });
    expect(totalLevel(s)).toBe(N + 9);
  });

  test("multiple elevated skills sum additively", () => {
    const s = withSkills({ js: 30, ts: 20 });
    // js contributes 30, ts contributes 20, all others contribute 1 each (N-2 skills)
    expect(totalLevel(s)).toBe(30 + 20 + (N - 2));
  });

  test("missing skill id defaults to Lv1 (not 0)", () => {
    const s = freshState({ skills: {} });
    // totalLevel reads state.skills[id]?.xp ?? 0 → levelForXp(0) = 1 for every skill
    expect(totalLevel(s)).toBe(N);
  });
});

describe("currentRank", () => {
  test("returns a valid rank from RANKS list", () => {
    const s = freshState();
    const r = currentRank(s);
    expect(RANKS).toContain(r);
  });

  test("ミドル at totalLevel=80", () => {
    const s = stateForTotal(80);
    const r = currentRank(s);
    expect(r.name).toBe("ミドル");
    expect(totalLevel(s)).toBe(Math.max(N, 80));
  });

  test("シニア at totalLevel=160", () => {
    const s = stateForTotal(160);
    expect(currentRank(s).name).toBe("シニア");
    expect(totalLevel(s)).toBe(160);
  });

  test("テックリード at totalLevel=280", () => {
    const s = stateForTotal(280);
    expect(currentRank(s).name).toBe("テックリード");
    expect(totalLevel(s)).toBe(280);
  });

  test("社長 at totalLevel=700", () => {
    const s = stateForTotal(700);
    expect(currentRank(s).name).toBe("社長");
    expect(totalLevel(s)).toBe(700);
  });

  test("rank is monotone: higher totalLevel never gives lower rank", () => {
    const thresholds = [80, 160, 280, 450, 700];
    let prevIndex = 0;
    for (const t of thresholds) {
      const r = currentRank(stateForTotal(t));
      expect(r.index).toBeGreaterThanOrEqual(prevIndex);
      prevIndex = r.index;
    }
  });

  test("1 below ミドル threshold = ジュニア", () => {
    const s = stateForTotal(79);
    expect(currentRank(s).name).toBe("ジュニア");
  });

  test("1 below シニア threshold = ミドル", () => {
    const s = stateForTotal(159);
    expect(currentRank(s).name).toBe("ミドル");
  });
});

describe("nextRank", () => {
  test("社長 (top rank) → null", () => {
    const s = stateForTotal(700);
    expect(nextRank(s)).toBeNull();
  });

  test("nextRank index = currentRank index + 1", () => {
    for (const target of [80, 160, 280, 450]) {
      const s = stateForTotal(target);
      const cur = currentRank(s);
      const next = nextRank(s);
      expect(next).not.toBeNull();
      expect(next!.index).toBe(cur.index + 1);
    }
  });

  test("nextRank.total > currentRank.total", () => {
    const s = stateForTotal(160);
    const cur = currentRank(s);
    const next = nextRank(s)!;
    expect(next.total).toBeGreaterThan(cur.total);
  });
});

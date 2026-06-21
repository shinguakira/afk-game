import { describe, expect, test } from "vitest";
import { resolveModifiers, mult } from "@/lib/modifiers";
import type { Modifier } from "@/types/effects";

describe("resolveModifiers", () => {
  test("empty list → empty Effects object", () => {
    expect(resolveModifiers([])).toEqual({});
  });

  test("single +10% modifier → multiplier 1.1", () => {
    const mods: Modifier[] = [{ key: "gold", pct: 10 }];
    expect(resolveModifiers(mods).gold).toBeCloseTo(1.1);
  });

  test("two modifiers on same key stack additively (+10 +20 = +30 = 1.3)", () => {
    const mods: Modifier[] = [
      { key: "gold", pct: 10 },
      { key: "gold", pct: 20 },
    ];
    expect(resolveModifiers(mods).gold).toBeCloseTo(1.3);
  });

  test("negative modifier reduces multiplier (-50% → 0.5)", () => {
    const mods: Modifier[] = [{ key: "speed.gather", pct: -50 }];
    expect(resolveModifiers(mods)["speed.gather"]).toBeCloseTo(0.5);
  });

  test("extreme negative is floored at 0.1", () => {
    const mods: Modifier[] = [{ key: "speed.gather", pct: -200 }];
    expect(resolveModifiers(mods)["speed.gather"]).toBeCloseTo(0.1);
  });

  test("modifiers on different keys are independent", () => {
    const mods: Modifier[] = [
      { key: "gold", pct: 50 },
      { key: "xp.gather", pct: 25 },
    ];
    const eff = resolveModifiers(mods);
    expect(eff.gold).toBeCloseTo(1.5);
    expect(eff["xp.gather"]).toBeCloseTo(1.25);
    expect(eff["speed.craft"]).toBeUndefined();
  });

  test("+0% modifier → multiplier exactly 1.0", () => {
    const mods: Modifier[] = [{ key: "gold", pct: 0 }];
    expect(resolveModifiers(mods).gold).toBe(1.0);
  });
});

describe("mult", () => {
  test("returns 1 when key is absent from Effects", () => {
    expect(mult({}, "gold")).toBe(1);
    expect(mult({}, "speed.gather")).toBe(1);
  });

  test("returns stored value when key is present", () => {
    expect(mult({ gold: 1.5 }, "gold")).toBe(1.5);
    expect(mult({ "xp.craft": 0.8 }, "xp.craft")).toBe(0.8);
  });

  test("composed: resolveModifiers → mult gives expected multiplier", () => {
    const eff = resolveModifiers([{ key: "speed.craft", pct: 35 }]);
    expect(mult(eff, "speed.craft")).toBeCloseTo(1.35);
    expect(mult(eff, "gold")).toBe(1); // unrelated key → default
  });
});

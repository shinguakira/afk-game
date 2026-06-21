import { expect, test } from "vitest";
import { simulateOffline } from "../src/lib/progression";
import { getCombatStats } from "../src/lib/combat";
import { xpForLevel } from "../src/lib/xp";
import { ACTION_MAP } from "../src/constants/maps";
import { FARM_CROP_MAP } from "../src/constants/farming";
import type { SaveState } from "../src/types/save";

function freshState(over: Partial<SaveState> = {}): SaveState {
  return {
    version: 6,
    skills: {
      js: { xp: 0 },
      ts: { xp: 0 },
      python: { xp: 0 },
      impl: { xp: 0 },
      robust: { xp: 0 },
      mental: { xp: xpForLevel(10) },
    },
    bank: {},
    gold: 0,
    jobClass: null,
    prestigePoints: 0,
    prestigeUpgrades: {},
    prestigeCount: 0,
    milestones: [],
    equipment: {},
    selectedFood: null,
    playerName: "test",
    mainLang: null,
    interestLangs: [],
    onboarded: true,
    playerHp: 100,
    active: null,
    actionProgress: 0,
    plots: [],
    lastSaved: 0,
    ...over,
  };
}

test("language coding: 1h of code_js => 1200 commits, 18000 xp", () => {
  const s = freshState({ active: { kind: "skill", actionId: "code_js" } });
  const sum = simulateOffline(s, 3_600_000);
  expect(s.bank.commit ?? 0).toBe(1200);
  expect(s.skills.js.xp).toBe(1200 * 15);
  expect(sum.items.commit ?? 0).toBe(1200);
});

test("framework action consumes commits -> language(main) + platform(sub) xp", () => {
  const s = freshState({
    active: { kind: "skill", actionId: "fw_ts_react" },
    bank: { commit: 120 },
  });
  simulateOffline(s, 3_600_000);
  const react = ACTION_MAP["fw_ts_react"];
  expect(s.bank.commit ?? 0).toBe(0); // 120 / 4 = 30 完了で消費
  expect(s.bank.product ?? 0).toBe(0); // product 廃止
  expect(s.skills.ts.xp).toBe(30 * react.xp);
  expect(s.skills.plat_web?.xp ?? 0).toBe(30 * (react.xpAlso?.xp ?? 0));
});

test("combat: 1h yields 実装力 xp and rewards", () => {
  const s = freshState({
    active: { kind: "combat", monsterId: "bugfix_javascript" },
    selectedFood: "coffee",
    bank: { coffee: 100 },
  });
  simulateOffline(s, 3_600_000);
  expect(s.skills.impl.xp).toBeGreaterThan(0);
});

test("no active action => empty summary, no changes", () => {
  const sum = simulateOffline(freshState(), 3_600_000);
  expect(sum.gold).toBe(0);
  expect(Object.keys(sum.items).length).toBe(0);
});

test("SRE +35% craft speed => ~35% more framework 言語xp", () => {
  const mk = (jobClass: SaveState["jobClass"]) =>
    freshState({
      active: { kind: "skill", actionId: "fw_ts_react" },
      bank: { commit: 1_000_000 },
      jobClass,
    });
  const base = mk(null);
  const sre = mk("sre");
  simulateOffline(base, 600_000);
  simulateOffline(sre, 600_000);
  expect((sre.skills.ts.xp ?? 0) / (base.skills.ts.xp ?? 1)).toBeCloseTo(1.35, 1);
});

test("class modifiers flow into combat stats (QA defence +40%, security HP +20%)", () => {
  const lv20 = {
    robust: { xp: xpForLevel(20) },
    mental: { xp: xpForLevel(20) },
  } as SaveState["skills"];
  const none = getCombatStats(freshState({ skills: lv20 }));
  const qa = getCombatStats(freshState({ jobClass: "qa", skills: lv20 }));
  expect(qa.defenceRating).toBe(Math.round(none.defenceRating * 1.4));
  const mentalOnly = { mental: { xp: xpForLevel(20) } } as SaveState["skills"];
  const sec = getCombatStats(freshState({ jobClass: "security", skills: mentalOnly }));
  const plain = getCombatStats(freshState({ skills: mentalOnly }));
  expect(sec.maxHp).toBe(Math.floor(plain.maxHp * 1.2));
});

test("prestige funding Lv5 = +60% gold", () => {
  const mk = (upg: Record<string, number>) =>
    freshState({
      active: { kind: "combat", monsterId: "bugfix_javascript" },
      selectedFood: "coffee",
      bank: { coffee: 100 },
      prestigeUpgrades: upg,
    });
  const a = simulateOffline(mk({}), 600_000);
  const b = simulateOffline(mk({ funding: 5 }), 600_000);
  expect(b.gold / a.gold).toBeCloseTo(1.6, 1);
});

test("equipment modifiers flow: entry PC +10% gather speed", () => {
  const base = freshState({ active: { kind: "skill", actionId: "code_js" } });
  const withPc = freshState({
    active: { kind: "skill", actionId: "code_js" },
    equipment: { pc: "pc_low" },
  });
  simulateOffline(base, 600_000);
  simulateOffline(withPc, 600_000);
  expect((withPc.bank.commit ?? 0) / (base.bank.commit ?? 1)).toBeCloseTo(1.1, 1);
});

test("craft bonus reaches cooking: SRE +35% speed.craft", () => {
  const mk = (jobClass: SaveState["jobClass"]) =>
    freshState({
      active: { kind: "skill", actionId: "cook_onigiri" },
      bank: { rice: 1_000_000 },
      jobClass,
    });
  const base = mk(null);
  const sre = mk("sre");
  simulateOffline(base, 600_000);
  simulateOffline(sre, 600_000);
  expect((sre.bank.onigiri ?? 0) / (base.bank.onigiri ?? 1)).toBeCloseTo(1.35, 1);
});

test("farming: crops grow offline, capped at growMs", () => {
  const tg = FARM_CROP_MAP["tomato"].growMs;
  const s = freshState({ plots: [{ crop: "tomato", growth: 0 }] });
  simulateOffline(s, Math.round(tg / 3));
  expect(Math.round(s.plots[0].growth)).toBe(Math.round(tg / 3));
  simulateOffline(s, tg);
  expect(s.plots[0].growth).toBe(tg);
});

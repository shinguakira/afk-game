// Quick standalone check of offline progression. Run: npx tsx src/game/offline.test.ts
import { simulateOffline } from "./progression";
import { getCombatStats } from "./combat";
import { xpForLevel } from "./xp";
import { ACTION_MAP } from "./data";
import type { SaveState } from "./types";

let failures = 0;
function check(label: string, actual: number, expected: number, tol = 0) {
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}: got ${actual}, expected ${expected}${tol ? ` (±${tol})` : ""}`,
  );
}

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
    playerHp: 100,
    active: null,
    actionProgress: 0,
    plots: [],
    lastSaved: 0,
    ...over,
  };
}

// 1) Language coding: 1h of code_js (3s, 15xp) => 1200 commits, 18000 xp.
{
  const s = freshState({ active: { kind: "skill", actionId: "code_js" } });
  const sum = simulateOffline(s, 3_600_000);
  check("code_js 1h commits", s.bank.commit ?? 0, 1200);
  check("code_js 1h xp", s.skills.js.xp, 1200 * 15);
  check("summary commits", sum.items.commit ?? 0, 1200);
}

// 2) Framework action (React, under TypeScript): commit を消費して言語(主)＋領域(副)XPに変換。
//    120 commits / 4 = 30 完了。product は廃止。副次で plat_web にも入る。
{
  const s = freshState({
    active: { kind: "skill", actionId: "fw_ts_react" },
    bank: { commit: 120 },
  });
  simulateOffline(s, 3_600_000);
  const react = ACTION_MAP["fw_ts_react"];
  check("fw_ts_react consumed all commits", s.bank.commit ?? 0, 0);
  check("fw_ts_react no product item", s.bank.product ?? 0, 0);
  check("fw_ts_react ts(言語) xp", s.skills.ts.xp, 30 * react.xp);
  check("fw_ts_react plat_web(領域) xp", s.skills.plat_web?.xp ?? 0, 30 * (react.xpAlso?.xp ?? 0));
}

// 3) Combat: 1h on bugs yields a positive, capped amount with rewards.
{
  const s = freshState({
    active: { kind: "combat", monsterId: "bugfix" },
    selectedFood: "coffee",
    bank: { coffee: 100 },
  });
  const sum = simulateOffline(s, 3_600_000);
  const gotXp = s.skills.impl.xp > 0;
  console.log(
    `${gotXp ? "PASS" : "FAIL"}  combat 1h gained 実装力 xp: ${s.skills.impl.xp}`,
  );
  if (!gotXp) failures++;
  console.log(
    `      combat 1h: gold +${sum.gold}, commit +${s.bank.commit ?? 0}, mental ${s.playerHp}`,
  );
}

// 4) No active action => empty summary, no changes.
{
  const s = freshState();
  const sum = simulateOffline(s, 3_600_000);
  check("idle gold", sum.gold, 0);
  check("idle items", Object.keys(sum.items).length, 0);
}

// 5) Class modifier: SRE gives +35% craft speed => 35% more framework completions => 35% more 言語XP.
//    (framework は inputs を持つ craft 扱いなので craft 速度補正が効く。product 廃止につき XP 量で検証。)
{
  const base = freshState({
    active: { kind: "skill", actionId: "fw_ts_react" },
    bank: { commit: 1_000_000 },
  });
  const withSre = freshState({
    active: { kind: "skill", actionId: "fw_ts_react" },
    bank: { commit: 1_000_000 },
    jobClass: "sre",
  });
  simulateOffline(base, 600_000);
  simulateOffline(withSre, 600_000);
  const ratio = (withSre.skills.ts.xp ?? 0) / (base.skills.ts.xp ?? 1);
  const ok = Math.abs(ratio - 1.35) < 0.02;
  console.log(
    `${ok ? "PASS" : "FAIL"}  SRE craft-speed ratio ≈1.35 (言語xp): base ${base.skills.ts.xp.toFixed(0)}, sre ${withSre.skills.ts.xp.toFixed(0)} (${ratio.toFixed(3)})`,
  );
  if (!ok) failures++;
}

// 6) Class modifiers flow into combat stats: QA +40% 堅牢性, security +20% HP.
{
  const none = getCombatStats(
    freshState({ skills: { robust: { xp: xpForLevel(20) }, mental: { xp: xpForLevel(20) } } as any }),
  );
  const qa = getCombatStats(
    freshState({ jobClass: "qa", skills: { robust: { xp: xpForLevel(20) }, mental: { xp: xpForLevel(20) } } as any }),
  );
  check("QA defence +40%", qa.defenceRating, Math.round(none.defenceRating * 1.4));
  const sec = getCombatStats(freshState({ jobClass: "security", skills: { mental: { xp: xpForLevel(20) } } as any }));
  const plain = getCombatStats(freshState({ skills: { mental: { xp: xpForLevel(20) } } as any }));
  check("Security maxHp +20%", sec.maxHp, Math.floor(plain.maxHp * 1.2));
}

// 7) Prestige upgrade stacks: funding Lv5 = +60% gold.
{
  const plain = freshState({
    active: { kind: "combat", monsterId: "bugfix" },
    selectedFood: "coffee",
    bank: { coffee: 100 },
  });
  const funded = freshState({
    active: { kind: "combat", monsterId: "bugfix" },
    selectedFood: "coffee",
    bank: { coffee: 100 },
    prestigeUpgrades: { funding: 5 },
  });
  const a = simulateOffline(plain, 600_000);
  const b = simulateOffline(funded, 600_000);
  const ratio = b.gold / a.gold;
  const ok = Math.abs(ratio - 1.6) < 0.03;
  console.log(
    `${ok ? "PASS" : "FAIL"}  funding Lv5 gold ×1.6: ${a.gold} → ${b.gold} (${ratio.toFixed(3)})`,
  );
  if (!ok) failures++;
}

// 8) Equipment modifiers flow: エントリーPC gives +10% gather speed => +10% commits.
{
  const base = freshState({ active: { kind: "skill", actionId: "code_js" } });
  const withPc = freshState({
    active: { kind: "skill", actionId: "code_js" },
    equipment: { pc: "pc_low" },
  });
  simulateOffline(base, 600_000);
  simulateOffline(withPc, 600_000);
  const ratio = (withPc.bank.commit ?? 0) / (base.bank.commit ?? 1);
  const ok = Math.abs(ratio - 1.1) < 0.02;
  console.log(
    `${ok ? "PASS" : "FAIL"}  PC +10% gather: ${base.bank.commit} → ${withPc.bank.commit} (${ratio.toFixed(3)})`,
  );
  if (!ok) failures++;
}

// 9) Craft bonus now propagates to COOKING (not just frameworks): SRE +35% speed.craft.
{
  const base = freshState({
    active: { kind: "skill", actionId: "cook_onigiri" },
    bank: { rice: 1_000_000 },
  });
  const sre = freshState({
    active: { kind: "skill", actionId: "cook_onigiri" },
    bank: { rice: 1_000_000 },
    jobClass: "sre",
  });
  simulateOffline(base, 600_000);
  simulateOffline(sre, 600_000);
  const ratio = (sre.bank.onigiri ?? 0) / (base.bank.onigiri ?? 1);
  const ok = Math.abs(ratio - 1.35) < 0.02;
  console.log(
    `${ok ? "PASS" : "FAIL"}  SRE craft bonus reaches 料理: ${base.bank.onigiri} → ${sre.bank.onigiri} (${ratio.toFixed(3)})`,
  );
  if (!ok) failures++;
}

// 9) 農業: 作物は active と独立に放置で育つ（オフラインでも成長、上限でキャップ）。
{
  const s = freshState({ plots: [{ crop: "tomato", growth: 0 }] }); // tomato growMs=45s
  simulateOffline(s, 30_000); // 30s 経過
  check("plot grows offline (30s)", Math.round(s.plots[0].growth), 30_000);
  simulateOffline(s, 60_000); // さらに60s → 45sでキャップ
  check("plot growth caps at growMs", s.plots[0].growth, 45_000);
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);

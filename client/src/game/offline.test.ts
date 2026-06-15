// Quick standalone check of offline progression. Run: npx tsx src/game/offline.test.ts
import { simulateOffline } from "./progression";
import { getCombatStats } from "./combat";
import { xpForLevel } from "./xp";
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
      react: { xp: 0 },
      impl: { xp: 0 },
      robust: { xp: 0 },
      mental: { xp: xpForLevel(10) },
    },
    bank: {},
    gold: 0,
    jobClass: null,
    subordinates: [],
    prestigePoints: 0,
    prestigeUpgrades: {},
    prestigeCount: 0,
    equippedWeapon: null,
    selectedFood: null,
    playerHp: 100,
    active: null,
    actionProgress: 0,
    lastSaved: 0,
    ...over,
  };
}

// 1) Language coding: 1h of write_js (3s, 15xp) => 1200 commits, 18000 xp.
{
  const s = freshState({ active: { kind: "skill", actionId: "write_js" } });
  const sum = simulateOffline(s, 3_600_000);
  check("write_js 1h commits", s.bank.commit ?? 0, 1200);
  check("write_js 1h xp", s.skills.js.xp, 1200 * 15);
  check("summary commits", sum.items.commit ?? 0, 1200);
}

// 2) Framework build is input-limited: 120 commits / 4 => 30 products over 1h.
{
  const s = freshState({
    active: { kind: "skill", actionId: "build_react" },
    bank: { commit: 120 },
  });
  simulateOffline(s, 3_600_000);
  check("build_react products", s.bank.product ?? 0, 30);
  check("build_react consumed commits", s.bank.commit ?? 0, 0);
  check("build_react xp", s.skills.react.xp, 30 * 26);
}

// 3) Combat: 1h on bugs yields a positive, capped amount with rewards.
{
  const s = freshState({
    active: { kind: "combat", monsterId: "bug" },
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
    `      combat 1h: gold +${sum.gold}, tech_debt +${s.bank.tech_debt ?? 0}, mental ${s.playerHp}`,
  );
}

// 4) No active action => empty summary, no changes.
{
  const s = freshState();
  const sum = simulateOffline(s, 3_600_000);
  check("idle gold", sum.gold, 0);
  check("idle items", Object.keys(sum.items).length, 0);
}

// 5) Class modifier: SRE gives +35% craft speed => 35% more products.
{
  const base = freshState({
    active: { kind: "skill", actionId: "build_react" },
    bank: { commit: 1_000_000 },
  });
  const withSre = freshState({
    active: { kind: "skill", actionId: "build_react" },
    bank: { commit: 1_000_000 },
    jobClass: "sre",
  });
  simulateOffline(base, 600_000);
  simulateOffline(withSre, 600_000);
  const ratio = (withSre.bank.product ?? 0) / (base.bank.product ?? 1);
  const ok = Math.abs(ratio - 1.35) < 0.02;
  console.log(
    `${ok ? "PASS" : "FAIL"}  SRE craft-speed ratio ≈1.35: base ${base.bank.product}, sre ${withSre.bank.product} (${ratio.toFixed(3)})`,
  );
  if (!ok) failures++;
}

// 5b) Subordinates produce in parallel offline (independent of player action).
{
  const s = freshState({
    active: { kind: "skill", actionId: "write_js" }, // player codes JS
    subordinates: [
      { id: "x", name: "新人", xp: 0, assignment: "write_python", progress: 0 },
    ],
  });
  simulateOffline(s, 600_000); // 10 min
  const commit = s.bank.commit ?? 0;
  const subXp = s.subordinates[0].xp;
  // player makes ~200 commits in 10min; subordinate adds more on top + gains xp
  const ok = commit > 250 && subXp > 0;
  console.log(
    `${ok ? "PASS" : "FAIL"}  parallel offline: total commits ${commit}, sub xp ${subXp}`,
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
    active: { kind: "combat", monsterId: "bug" },
    selectedFood: "coffee",
    bank: { coffee: 100 },
  });
  const funded = freshState({
    active: { kind: "combat", monsterId: "bug" },
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

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);

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
    version: 1,
    skills: {
      learning: { xp: 0 },
      design: { xp: 0 },
      debug: { xp: 0 },
      impl: { xp: 0 },
      robust: { xp: 0 },
      mental: { xp: xpForLevel(10) },
    },
    bank: {},
    gold: 0,
    jobClass: null,
    equippedWeapon: null,
    selectedFood: null,
    playerHp: 100,
    active: null,
    actionProgress: 0,
    lastSaved: 0,
    ...over,
  };
}

// 1) Gathering: 1 hour of study (3s, 15xp) => 1200 knowledge, 18000 xp.
{
  const s = freshState({ active: { kind: "skill", actionId: "study" } });
  const sum = simulateOffline(s, 3_600_000);
  check("study 1h knowledge", s.bank.knowledge ?? 0, 1200);
  check("study 1h xp", s.skills.learning.xp, 1200 * 15);
  check("summary knowledge", sum.items.knowledge ?? 0, 1200);
}

// 2) Crafting is input-limited: 90 knowledge => only 30 design docs (3 each) over 1h.
{
  const s = freshState({
    active: { kind: "skill", actionId: "write_design" },
    bank: { knowledge: 90 },
  });
  simulateOffline(s, 3_600_000);
  check("design limited docs", s.bank.design_doc ?? 0, 30);
  check("design consumed knowledge", s.bank.knowledge ?? 0, 0);
  check("design xp", s.skills.design.xp, 30 * 16);
}

// 3) Combat: 1h on bugs yields a positive, capped amount with rewards.
{
  const s = freshState({
    active: { kind: "combat", monsterId: "bug" },
    selectedFood: "coffee",
    bank: { coffee: 100 },
  });
  const before = s.skills.impl.xp;
  const sum = simulateOffline(s, 3_600_000);
  const gotXp = s.skills.impl.xp > before;
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

// 5) Class modifier (v2): SRE gives +35% craft speed => 35% more design docs.
{
  const base = freshState({
    active: { kind: "skill", actionId: "write_design" },
    bank: { knowledge: 100000 },
  });
  const withSre = freshState({
    active: { kind: "skill", actionId: "write_design" },
    bank: { knowledge: 100000 },
    jobClass: "sre",
  });
  simulateOffline(base, 600_000);
  simulateOffline(withSre, 600_000);
  const ratio = (withSre.bank.design_doc ?? 0) / (base.bank.design_doc ?? 1);
  const ok = Math.abs(ratio - 1.35) < 0.02;
  console.log(
    `${ok ? "PASS" : "FAIL"}  SRE craft-speed ratio ≈1.35: base ${base.bank.design_doc}, sre ${withSre.bank.design_doc} (${ratio.toFixed(3)})`,
  );
  if (!ok) failures++;
}

// 6) Class modifiers flow into combat stats: QA +40% 堅牢性, security +50%/+20% HP.
{
  const none = getCombatStats(freshState({ skills: { robust: { xp: xpForLevel(20) }, mental: { xp: xpForLevel(20) } } as any }));
  const qa = getCombatStats(freshState({ jobClass: "qa", skills: { robust: { xp: xpForLevel(20) }, mental: { xp: xpForLevel(20) } } as any }));
  check("QA defence +40%", qa.defenceRating, Math.round(none.defenceRating * 1.4));
  const sec = getCombatStats(freshState({ jobClass: "security", skills: { mental: { xp: xpForLevel(20) } } as any }));
  const plain = getCombatStats(freshState({ skills: { mental: { xp: xpForLevel(20) } } as any }));
  check("Security maxHp +20%", sec.maxHp, Math.floor(plain.maxHp * 1.2));
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);

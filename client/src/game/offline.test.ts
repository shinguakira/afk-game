// Quick standalone check of offline progression. Run: npx tsx src/game/offline.test.ts
import { simulateOffline } from "./progression";
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
      mining: { xp: 0 },
      smithing: { xp: 0 },
      attack: { xp: 0 },
      strength: { xp: 0 },
      defence: { xp: 0 },
      hitpoints: { xp: xpForLevel(10) },
    },
    bank: {},
    gold: 0,
    equippedWeapon: null,
    selectedFood: null,
    playerHp: 100,
    active: null,
    actionProgress: 0,
    lastSaved: 0,
    ...over,
  };
}

// 1) Gathering: 1 hour of Mine Copper (3s, 17xp) => 1200 ore, 20400 xp.
{
  const s = freshState({ active: { kind: "skill", actionId: "mine_copper" } });
  const sum = simulateOffline(s, 3_600_000);
  check("mine 1h ore", s.bank.copper_ore ?? 0, 1200);
  check("mine 1h xp", s.skills.mining.xp, 20400);
  check("summary ore", sum.items.copper_ore ?? 0, 1200);
}

// 2) Crafting is input-limited: 50 ore each => only 50 bronze bars even over 1h.
{
  const s = freshState({
    active: { kind: "skill", actionId: "smelt_bronze" },
    bank: { copper_ore: 50, tin_ore: 50 },
  });
  simulateOffline(s, 3_600_000);
  check("smelt limited bars", s.bank.bronze_bar ?? 0, 50);
  check("smelt consumed copper", s.bank.copper_ore ?? 0, 0);
  check("smelt xp", s.skills.smithing.xp, 50 * 12);
}

// 3) Combat: 1h on chickens yields a positive, capped amount with rewards.
{
  const s = freshState({
    active: { kind: "combat", monsterId: "chicken" },
    selectedFood: "bread",
    bank: { bread: 100 },
  });
  const before = s.skills.attack.xp;
  const sum = simulateOffline(s, 3_600_000);
  const gotXp = s.skills.attack.xp > before;
  console.log(
    `${gotXp ? "PASS" : "FAIL"}  combat 1h gained attack xp: ${s.skills.attack.xp}`,
  );
  if (!gotXp) failures++;
  console.log(
    `      combat 1h: gold +${sum.gold}, bones +${s.bank.bones ?? 0}, hp ${s.playerHp}`,
  );
}

// 4) No active action => empty summary, no changes.
{
  const s = freshState();
  const sum = simulateOffline(s, 3_600_000);
  check("idle gold", sum.gold, 0);
  check("idle items", Object.keys(sum.items).length, 0);
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);

import type { OfflineSummary, SaveState } from "./types";
import { ACTION_MAP, ITEM_MAP, MONSTER_MAP } from "./data";
import { avgEnemyDamage, avgPlayerDamage, getCombatStats } from "./combat";

/** Combat XP split: attack/strength/defence each get 1/3, hitpoints 1/3 on top. */
export function grantCombatXp(
  skills: SaveState["skills"],
  totalXp: number,
): SaveState["skills"] {
  const share = totalXp / 3;
  const next = { ...skills };
  for (const id of ["attack", "strength", "defence"] as const) {
    next[id] = { xp: (next[id]?.xp ?? 0) + share };
  }
  next.hitpoints = { xp: (next.hitpoints?.xp ?? 0) + share };
  return next;
}

/**
 * Compute AFK gains for `ms` of elapsed real time and APPLY them to `state`
 * (mutated in place). Returns a summary for the "welcome back" screen.
 * Gathering/crafting is exact; combat is an analytic average estimate.
 */
export function simulateOffline(state: SaveState, ms: number): OfflineSummary {
  const summary: OfflineSummary = { ms, xp: {}, items: {}, gold: 0 };
  if (!state.active) return summary;

  if (state.active.kind === "skill") {
    const action = ACTION_MAP[state.active.actionId];
    if (!action) return summary;

    let completions = Math.floor((ms + state.actionProgress) / action.time);

    if (action.inputs) {
      const maxByInputs = Math.min(
        ...Object.entries(action.inputs).map(([id, q]) =>
          Math.floor((state.bank[id] ?? 0) / (q as number)),
        ),
      );
      completions = Math.min(completions, maxByInputs);
      state.actionProgress = 0; // can't precisely track partial when input-limited
    } else {
      state.actionProgress =
        ms + state.actionProgress - completions * action.time;
    }

    if (completions <= 0) return summary;

    if (action.inputs) {
      for (const [id, q] of Object.entries(action.inputs)) {
        state.bank[id] = (state.bank[id] ?? 0) - (q as number) * completions;
        if (state.bank[id] <= 0) delete state.bank[id];
        summary.items[id] = (summary.items[id] ?? 0) - (q as number) * completions;
      }
    }
    for (const [id, q] of Object.entries(action.outputs)) {
      state.bank[id] = (state.bank[id] ?? 0) + (q as number) * completions;
      summary.items[id] = (summary.items[id] ?? 0) + (q as number) * completions;
    }
    const xp = action.xp * completions;
    state.skills[action.skill] = {
      xp: (state.skills[action.skill]?.xp ?? 0) + xp,
    };
    summary.xp[action.skill] = (summary.xp[action.skill] ?? 0) + xp;
    return summary;
  }

  // Combat (analytic average estimate).
  const monster = MONSTER_MAP[state.active.monsterId];
  if (!monster) return summary;
  const stats = getCombatStats(state);

  const dmgPerSwing = avgPlayerDamage(stats, monster);
  if (dmgPerSwing <= 0) return summary;
  const killTime = (monster.hp / dmgPerSwing) * stats.weaponSpeed;
  const dmgTakenPerKill =
    avgEnemyDamage(stats, monster) * (killTime / monster.speed);

  const food = state.selectedFood ? ITEM_MAP[state.selectedFood] : undefined;
  const foodCount = state.selectedFood ? state.bank[state.selectedFood] ?? 0 : 0;
  const heal = food?.heals ?? 0;
  const hpPool = state.playerHp + foodCount * heal;

  const killsByTime = Math.floor(ms / killTime);
  const killsByHp =
    dmgTakenPerKill > 0 ? Math.floor(hpPool / dmgTakenPerKill) : killsByTime;
  const kills = Math.max(0, Math.min(killsByTime, killsByHp));
  if (kills <= 0) return summary;

  const totalDamage = kills * dmgTakenPerKill;
  let foodUsed = 0;
  if (heal > 0) {
    foodUsed = Math.min(
      foodCount,
      Math.max(0, Math.ceil((totalDamage - state.playerHp) / heal)),
    );
    state.bank[state.selectedFood!] = foodCount - foodUsed;
    if (state.bank[state.selectedFood!] <= 0) delete state.bank[state.selectedFood!];
    summary.items[state.selectedFood!] =
      (summary.items[state.selectedFood!] ?? 0) - foodUsed;
  }
  let finalHp = Math.round(state.playerHp + foodUsed * heal - totalDamage);
  if (finalHp <= 0) finalHp = stats.maxHp; // died & revived
  state.playerHp = Math.min(stats.maxHp, Math.max(1, finalHp));

  // Rewards (averages).
  const goldGain = Math.floor(kills * ((monster.goldMin + monster.goldMax) / 2));
  state.gold += goldGain;
  summary.gold += goldGain;

  for (const drop of monster.loot) {
    const avgQty = drop.chance * ((drop.min + drop.max) / 2);
    const total = Math.floor(avgQty * kills);
    if (total > 0) {
      state.bank[drop.item] = (state.bank[drop.item] ?? 0) + total;
      summary.items[drop.item] = (summary.items[drop.item] ?? 0) + total;
    }
  }

  const totalXp = monster.xp * kills;
  state.skills = grantCombatXp(state.skills, totalXp);
  const share = totalXp / 3;
  for (const id of ["attack", "strength", "defence", "hitpoints"]) {
    summary.xp[id] = (summary.xp[id] ?? 0) + share;
  }

  return summary;
}

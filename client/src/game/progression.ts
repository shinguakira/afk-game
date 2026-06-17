import type { OfflineSummary, SaveState } from "./types";
import { ACTION_MAP, isCraftAction, ITEM_MAP, MONSTER_MAP, STAT } from "./data";
import { FARM_CROP_MAP, TEND_BOOST } from "./data/farming";
import { avgEnemyDamage, avgPlayerDamage, getCombatStats } from "./combat";
import { getEffects } from "./effects";
import { type Effects, mult } from "./modifiers";

/** Combat XP split: accuracy/damage/defence each get 1/3, mental 1/3 on top. */
export function grantCombatXp(
  skills: SaveState["skills"],
  totalXp: number,
): SaveState["skills"] {
  const share = totalXp / 3;
  const next = { ...skills };
  for (const id of [STAT.accuracy, STAT.damage, STAT.defence]) {
    next[id] = { xp: (next[id]?.xp ?? 0) + share };
  }
  next[STAT.mental] = { xp: (next[STAT.mental]?.xp ?? 0) + share };
  return next;
}

/**
 * Compute AFK gains for `ms` of elapsed real time and APPLY them to `state`
 * (mutated in place). Returns a summary for the "welcome back" screen.
 * Gathering/crafting is exact; combat is an analytic average estimate.
 */
export function simulateOffline(state: SaveState, ms: number): OfflineSummary {
  const summary: OfflineSummary = { ms, xp: {}, items: {}, gold: 0 };
  const eff = getEffects(state);

  if (state.active?.kind === "skill") simPlayerSkill(state, ms, summary, eff);
  else if (state.active?.kind === "combat") simPlayerCombat(state, ms, summary, eff);

  simPlots(state, ms); // 作物は放置で育つ（オフラインも進む。収穫は帰宅後に手動）

  return summary;
}

/** オフライン中の作物成長。手入れ中(active=farming)なら加速。収穫はしない（成長のみ）。 */
function simPlots(state: SaveState, ms: number): void {
  if (!state.plots) return;
  const tending =
    state.active?.kind === "skill" &&
    ACTION_MAP[state.active.actionId]?.skill === "farming";
  const rate = tending ? TEND_BOOST : 1;
  for (const p of state.plots) {
    if (!p.crop) continue;
    const spec = FARM_CROP_MAP[p.crop];
    if (!spec) continue;
    p.growth = Math.min(spec.growMs, p.growth + ms * rate);
  }
}

function simPlayerSkill(
  state: SaveState,
  ms: number,
  summary: OfflineSummary,
  eff: Effects,
): void {
  if (state.active?.kind !== "skill") return;
  const action = ACTION_MAP[state.active.actionId];
  if (!action) return;

  const craft = isCraftAction(action);
  const effTime = action.time / mult(eff, craft ? "speed.craft" : "speed.gather");
  const xpPer = action.xp * mult(eff, craft ? "xp.craft" : "xp.gather");

  let completions = Math.floor((ms + state.actionProgress) / effTime);

  if (action.inputs) {
    const maxByInputs = Math.min(
      ...Object.entries(action.inputs).map(([id, q]) =>
        Math.floor((state.bank[id] ?? 0) / (q as number)),
      ),
    );
    completions = Math.min(completions, maxByInputs);
    state.actionProgress = 0; // can't precisely track partial when input-limited
  } else {
    state.actionProgress = ms + state.actionProgress - completions * effTime;
  }

  if (completions <= 0) return;

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
  const xp = xpPer * completions;
  state.skills[action.skill] = {
    xp: (state.skills[action.skill]?.xp ?? 0) + xp,
  };
  summary.xp[action.skill] = (summary.xp[action.skill] ?? 0) + xp;

  // 副次XP（フレームワーク実装→領域など）。live(runSkillTick)と同じ計算で同時付与。
  const also = action.xpAlso;
  if (also) {
    const alsoXp = also.xp * mult(eff, craft ? "xp.craft" : "xp.gather") * completions;
    state.skills[also.skill] = {
      xp: (state.skills[also.skill]?.xp ?? 0) + alsoXp,
    };
    summary.xp[also.skill] = (summary.xp[also.skill] ?? 0) + alsoXp;
  }
}

/** 部下の並行生産をオフライン分まとめて適用（解析的）。 */
function simPlayerCombat(
  state: SaveState,
  ms: number,
  summary: OfflineSummary,
  eff: Effects,
): void {
  if (state.active?.kind !== "combat") return;
  const monster = MONSTER_MAP[state.active.monsterId];
  if (!monster) return;
  const stats = getCombatStats(state);

  const dmgPerSwing = avgPlayerDamage(stats, monster);
  if (dmgPerSwing <= 0) return;
  // regen は実効DPSを削る（倒しきれないと kills≈0）。
  const dpsPerMs = dmgPerSwing / stats.weaponSpeed;
  const effDpsPerMs = Math.max(0.00001, dpsPerMs - (monster.regen ?? 0) / 1000);
  const killTime = monster.hp / effDpsPerMs;
  // 被ダメ = 敵の通常攻撃 + DoT。
  const dmgTakenPerKill =
    avgEnemyDamage(stats, monster) * (killTime / monster.speed) +
    (monster.dot ?? 0) * (killTime / 1000);

  const food = state.selectedFood ? ITEM_MAP[state.selectedFood] : undefined;
  const foodCount = state.selectedFood ? state.bank[state.selectedFood] ?? 0 : 0;
  const heal = food?.heals ?? 0;
  const hpPool = state.playerHp + foodCount * heal;

  const killsByTime = Math.floor(ms / killTime);
  const killsByHp =
    dmgTakenPerKill > 0 ? Math.floor(hpPool / dmgTakenPerKill) : killsByTime;
  const kills = Math.max(0, Math.min(killsByTime, killsByHp));
  if (kills <= 0) return;

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

  // Rewards (averages, modifier-adjusted).
  const goldMult = mult(eff, "gold");
  const dropMult = mult(eff, "dropRate");
  const combatXpMult = mult(eff, "xp.combat");

  const goldGain = Math.floor(
    kills * ((monster.goldMin + monster.goldMax) / 2) * goldMult,
  );
  state.gold += goldGain;
  summary.gold += goldGain;

  for (const drop of monster.loot) {
    const avgQty = Math.min(1, drop.chance * dropMult) * ((drop.min + drop.max) / 2);
    const total = Math.floor(avgQty * kills);
    if (total > 0) {
      state.bank[drop.item] = (state.bank[drop.item] ?? 0) + total;
      summary.items[drop.item] = (summary.items[drop.item] ?? 0) + total;
    }
  }

  const totalXp = monster.xp * kills * combatXpMult;
  state.skills = grantCombatXp(state.skills, totalXp);
  const share = totalXp / 3;
  for (const id of [STAT.accuracy, STAT.damage, STAT.defence, STAT.mental]) {
    summary.xp[id] = (summary.xp[id] ?? 0) + share;
  }
}

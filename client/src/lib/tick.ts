// ゲームループの1tick処理: 生産/制作(runSkillTick)・戦闘(runCombatTick)・農業の放置成長
// (advancePlots)。store から分離。set/get 経由で store 状態を更新する。
import type { GameStore } from "@/store/types";
import { ACTION_MAP, ITEM_MAP, MONSTER_MAP, SKILL_MAP } from "@/constants/maps";
import { COMBAT_STAT_IDS } from "@/constants/skills";
import { FARM_CROP_MAP } from "@/constants/farming";
import { getEffects } from "@/lib/effects";
import { mult } from "@/lib/modifiers";
import { levelForXp, langXpMult, langLevelCap } from "@/lib/xp";
import { enemyHitChance, getCombatStats, playerHitChance } from "@/lib/combat";
import { grantCombatXp } from "@/lib/progression";
import { actionTiming, plotGrowthRate } from "@/lib/timing";
import { randInt } from "@/lib/util";
import { LOG_LIMIT } from "@/constants/config";

export type SetFn = (partial: Partial<GameStore>) => void;
export type GetFn = () => GameStore;

/** スキルがレベルアップしていたらトーストを出す。 */
export function toastLevelUp(get: GetFn, oldXp: number, newXp: number, skillId: string): void {
  const s = get();
  const cap = langLevelCap(s.mainLang, s.interestLangs, skillId);
  const before = levelForXp(oldXp, cap);
  const after = levelForXp(newXp, cap);
  if (after > before) {
    const sk = SKILL_MAP[skillId];
    get().pushToast({
      text: `${sk?.name ?? skillId} が Lv${after} に！`,
      icon: sk?.icon,
      kind: "level",
    });
  }
}

/** 作物の放置成長。activeとは独立に毎tick進む。手入れ中(active=farming)は加速。 */
export function advancePlots(set: SetFn, get: GetFn, dt: number): void {
  const s = get();
  if (!s.plots?.some((p) => p.crop)) return;
  const rate = plotGrowthRate(s);
  let changed = false;
  const plots = s.plots.map((p) => {
    if (!p.crop) return p;
    const spec = FARM_CROP_MAP[p.crop];
    if (!spec || p.growth >= spec.growMs) return p;
    changed = true;
    return { ...p, growth: Math.min(spec.growMs, p.growth + dt * rate) };
  });
  if (changed) set({ plots });
}

export function runSkillTick(set: SetFn, get: GetFn, dt: number): void {
  const s = get();
  if (s.active?.kind !== "skill") return;
  const action = ACTION_MAP[s.active.actionId];
  if (!action) {
    set({ active: null });
    return;
  }

  const eff = getEffects(s);
  const { isCraft, effTime, xpPer } = actionTiming(action, eff);

  let progress = s.actionProgress + dt;
  const bank = { ...s.bank };
  let xpGained = 0;
  let completions = 0;
  let stopped = false;
  let guard = 1000;

  while (progress >= effTime && guard-- > 0) {
    // Craft actions need their inputs available.
    if (action.inputs) {
      const ok = Object.entries(action.inputs).every(([id, q]) => (bank[id] ?? 0) >= (q as number));
      if (!ok) {
        stopped = true;
        progress = 0;
        break;
      }
      for (const [id, q] of Object.entries(action.inputs)) {
        bank[id] = (bank[id] ?? 0) - (q as number);
        if (bank[id] <= 0) delete bank[id];
      }
    }
    for (const [id, q] of Object.entries(action.outputs)) {
      bank[id] = (bank[id] ?? 0) + (q as number);
    }
    xpGained += xpPer;
    completions++;
    progress -= effTime;
  }

  // 副次XP: フレームワーク実装などは言語(主)に加えてドメイン(副)へも入る（概念は分離・獲得は同時）。
  const also = action.xpAlso;
  const xpMult = mult(eff, isCraft ? "xp.craft" : "xp.gather");
  const langMult = langXpMult(s.mainLang, s.interestLangs, action.skill);
  const alsoLangMult = also ? langXpMult(s.mainLang, s.interestLangs, also.skill) : 1;
  const alsoXp = also && completions > 0 ? completions * also.xp * xpMult * alsoLangMult : 0;

  let skills =
    xpGained > 0
      ? {
          ...s.skills,
          [action.skill]: {
            xp: (s.skills[action.skill]?.xp ?? 0) + xpGained * langMult,
          },
        }
      : s.skills;
  if (also && alsoXp > 0) {
    skills = {
      ...skills,
      [also.skill]: { xp: (s.skills[also.skill]?.xp ?? 0) + alsoXp },
    };
  }

  set({ bank, skills, actionProgress: progress, active: stopped ? null : s.active });
  if (xpGained > 0) {
    get().flashXp(action.skill, Math.round(xpGained * langMult));
    toastLevelUp(get, s.skills[action.skill]?.xp ?? 0, skills[action.skill]?.xp ?? 0, action.skill);
  }
  if (also && alsoXp > 0) {
    get().flashXp(also.skill, Math.round(alsoXp));
    toastLevelUp(get, s.skills[also.skill]?.xp ?? 0, skills[also.skill]?.xp ?? 0, also.skill);
  }
  if (stopped) get().pushLog(`素材切れ: ${action.name}`);
}

export function runCombatTick(set: SetFn, get: GetFn, dt: number): void {
  const s = get();
  if (s.active?.kind !== "combat") return;
  const monster = MONSTER_MAP[s.active.monsterId];
  if (!monster) {
    set({ active: null });
    return;
  }

  const stats = getCombatStats(s);
  const eff = getEffects(s);
  const goldMult = mult(eff, "gold");
  const dropMult = mult(eff, "dropRate");
  const combatXpMult = mult(eff, "xp.combat");
  // 特攻補正: weakTo 言語スキルのレベル÷100 だけ与ダメージが上昇（最大99%増）。
  const weakMult = monster.weakTo
    ? 1 + levelForXp(s.skills[monster.weakTo]?.xp ?? 0) / 100
    : 1;
  let combatXpGained = 0;
  let enemyHp = s.enemyHp > 0 ? s.enemyHp : monster.hp;
  let playerHp = s.playerHp > 0 ? s.playerHp : stats.maxHp;
  let playerTimer = s.playerTimer + dt;
  let enemyTimer = s.enemyTimer + dt;

  // 継続効果: 案件のメンタル継続ダメージ(DoT) と 自己回復(regen) を dt 分適用。
  if (monster.dot) playerHp -= monster.dot * (dt / 1000);
  if (monster.regen && enemyHp > 0 && enemyHp < monster.hp) {
    enemyHp = Math.min(monster.hp, enemyHp + monster.regen * (dt / 1000));
  }
  let bank = { ...s.bank };
  let gold = s.gold;
  let skills = s.skills;
  const logs: string[] = [];
  let stopped = false;
  let guard = 200;

  while (guard-- > 0 && !stopped) {
    const playerReady = playerTimer >= stats.weaponSpeed;
    const enemyReady = enemyTimer >= monster.speed;
    if (!playerReady && !enemyReady) break;

    // Whichever attack is "more overdue" resolves first.
    const playerLead = playerTimer - stats.weaponSpeed;
    const enemyLead = enemyTimer - monster.speed;

    if (playerReady && (!enemyReady || playerLead >= enemyLead)) {
      playerTimer -= stats.weaponSpeed;
      if (Math.random() < playerHitChance(stats, monster)) {
        enemyHp -= Math.ceil(randInt(1, stats.maxHit) * weakMult);
      }
      if (enemyHp <= 0) {
        // Kill rewards (modifier-adjusted).
        gold += Math.round(randInt(monster.goldMin, monster.goldMax) * goldMult);
        for (const drop of monster.loot) {
          if (Math.random() < Math.min(1, drop.chance * dropMult)) {
            const qty = randInt(drop.min, drop.max);
            bank[drop.item] = (bank[drop.item] ?? 0) + qty;
          }
        }
        skills = grantCombatXp(skills, monster.xp * combatXpMult);
        combatXpGained += monster.xp * combatXpMult;
        // 特攻言語XP: 撃破ごとに付与。
        if (monster.xpAlso) {
          const langXp = monster.xpAlso.xp;
          const prevLangXp = skills[monster.xpAlso.skill]?.xp ?? 0;
          skills = {
            ...skills,
            [monster.xpAlso.skill]: { xp: prevLangXp + langXp },
          };
          get().flashXp(monster.xpAlso.skill, Math.round(langXp));
          toastLevelUp(get, prevLangXp, prevLangXp + langXp, monster.xpAlso.skill);
        }
        logs.push(`${monster.name} を解決！ (+${Math.round(monster.xp * combatXpMult)} xp)`);
        enemyHp = monster.hp; // respawn next target
      }
    } else if (enemyReady) {
      enemyTimer -= monster.speed;
      if (Math.random() < enemyHitChance(stats, monster)) {
        playerHp -= randInt(1, monster.maxHit);
      }
      // Auto-eat below half HP.
      if (playerHp <= stats.maxHp * 0.5 && s.selectedFood && (bank[s.selectedFood] ?? 0) > 0) {
        const food = ITEM_MAP[s.selectedFood];
        if (food?.heals) {
          bank[s.selectedFood] = (bank[s.selectedFood] ?? 0) - 1;
          if (bank[s.selectedFood] <= 0) delete bank[s.selectedFood];
          playerHp = Math.min(stats.maxHp, playerHp + food.heals);
          logs.push(`${food.name} を摂取 (+${food.heals})`);
        }
      }
      if (playerHp <= 0) {
        // Death: stop fighting, revive at full HP, keep loot.
        playerHp = stats.maxHp;
        stopped = true;
        logs.push(`燃え尽きた…！案件から離脱。`);
      }
    } else {
      break;
    }
  }

  // DoT などで0以下になったら燃え尽き（攻撃の合間でも確実に処理）。
  if (!stopped && playerHp <= 0) {
    playerHp = stats.maxHp;
    stopped = true;
    logs.push(`燃え尽きた…！案件から離脱。`);
  }

  set({
    enemyHp,
    playerHp,
    playerTimer,
    enemyTimer,
    bank,
    gold,
    skills,
    active: stopped ? null : s.active,
  });
  if (logs.length) {
    const cur = get().log;
    set({ log: [...logs.reverse(), ...cur].slice(0, LOG_LIMIT) });
  }
  for (const id of COMBAT_STAT_IDS) {
    toastLevelUp(get, s.skills[id]?.xp ?? 0, skills[id]?.xp ?? 0, id);
  }
  if (combatXpGained > 0) get().flashXp("combat", Math.round(combatXpGained));
}

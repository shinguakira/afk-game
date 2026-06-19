import type { StateCreator } from "zustand";
import type { GameStore, LoopSlice } from "../types";
import { ACTION_MAP, MONSTER_MAP } from "../../constants/maps";
import { getCombatStats } from "../../lib/combat";
import { advancePlots, runCombatTick, runSkillTick } from "../../lib/tick";

export const createLoopSlice: StateCreator<GameStore, [], [], LoopSlice> = (set, get) => ({
  enemyHp: 0,
  playerTimer: 0,
  enemyTimer: 0,

  tick: (dt) => {
    const s = get();
    if (!s.ready) return;
    if (s.active?.kind === "skill") runSkillTick(set, get, dt);
    else if (s.active?.kind === "combat") runCombatTick(set, get, dt);
    advancePlots(set, get, dt);
    get().checkRoadmap();
  },

  startAction: (actionId) => {
    const action = ACTION_MAP[actionId];
    if (!action) return;
    set({ active: { kind: "skill", actionId }, actionProgress: 0, enemyHp: 0 });
    get().pushLog(`開始: ${action.name}`);
  },

  startCombat: (monsterId) => {
    const m = MONSTER_MAP[monsterId];
    if (!m) return;
    const stats = getCombatStats(get());
    set({
      active: { kind: "combat", monsterId },
      enemyHp: m.hp,
      playerTimer: 0,
      enemyTimer: 0,
      playerHp: get().playerHp > 0 ? get().playerHp : stats.maxHp,
    });
    get().pushLog(`着手: ${m.name}`);
  },

  stop: () => set({ active: null, actionProgress: 0, enemyHp: 0 }),
});

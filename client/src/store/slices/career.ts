import type { StateCreator } from "zustand";
import type { GameStore, CareerSlice } from "@/store/types";
import { CLASS_MAP, PRESTIGE_MAP } from "@/constants/maps";
import { MILESTONES } from "@/lib/roadmap";
import { prestigeGain } from "@/lib/prestige";
import { makeStartingState } from "@/store/state";

export const createCareerSlice: StateCreator<GameStore, [], [], CareerSlice> = (set, get) => ({
  setClass: (classId) => {
    set({ jobClass: classId });
    get().pushLog(`職種を変更: ${CLASS_MAP[classId]?.name ?? classId}`);
  },

  prestige: () => {
    const s = get();
    const gain = prestigeGain(s);
    if (gain <= 0) {
      get().pushLog("起業にはシニア以上の役職が必要です");
      return;
    }
    set({
      ...makeStartingState(),
      prestigePoints: s.prestigePoints + gain,
      prestigeUpgrades: s.prestigeUpgrades,
      prestigeCount: s.prestigeCount + 1,
      milestones: s.milestones,
      enemyHp: 0,
      playerTimer: 0,
      enemyTimer: 0,
    });
    get().pushLog(`🚀 独立して起業！ ストック +${gain}（通算 ${s.prestigeCount + 1} 回）`);
  },

  buyPrestigeUpgrade: (id) => {
    const s = get();
    const up = PRESTIGE_MAP[id];
    if (!up) return;
    const cur = s.prestigeUpgrades[id] ?? 0;
    if (cur >= up.maxLevel) return;
    const cost = up.cost(cur + 1);
    if (s.prestigePoints < cost) {
      get().pushLog("ストックが足りません");
      return;
    }
    set({
      prestigePoints: s.prestigePoints - cost,
      prestigeUpgrades: { ...s.prestigeUpgrades, [id]: cur + 1 },
    });
    get().pushLog(`${up.name} Lv${cur + 1} を取得`);
  },

  checkRoadmap: () => {
    const s = get();
    const done = new Set(s.milestones);
    let gold = s.gold;
    let bank = s.bank;
    const newly: string[] = [];
    for (const m of MILESTONES) {
      if (done.has(m.id) || !m.check(s)) continue;
      done.add(m.id);
      newly.push(m.title);
      if (m.reward?.gold) gold += m.reward.gold;
      if (m.reward?.items) {
        bank = { ...bank };
        for (const [id, q] of Object.entries(m.reward.items)) {
          bank[id] = (bank[id] ?? 0) + q;
        }
      }
    }
    if (newly.length === 0) return;
    set({ milestones: [...done], gold, bank });
    for (const title of newly) {
      get().pushLog(`目標達成: ${title}`);
      get().pushToast({ text: `目標達成: ${title}`, icon: "career", kind: "goal" });
    }
  },
});

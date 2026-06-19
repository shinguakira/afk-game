import type { StateCreator } from "zustand";
import type { GameStore, FarmingSlice } from "../types";
import { FARM_CROP_MAP } from "../../constants/farming";
import { levelForXp } from "../../lib/xp";
import { toastLevelUp } from "../../lib/tick";

export const createFarmingSlice: StateCreator<GameStore, [], [], FarmingSlice> = (set, get) => ({
  plantCrop: (plotIndex, cropId) => {
    set((s) => {
      const spec = FARM_CROP_MAP[cropId];
      const plot = s.plots[plotIndex];
      if (!spec || !plot || plot.crop) return {};
      if (levelForXp(s.skills.farming?.xp ?? 0) < spec.level) return {};
      let bank = s.bank;
      if (spec.seed) {
        if ((s.bank[spec.seed] ?? 0) < 1) return {};
        bank = { ...s.bank };
        bank[spec.seed] = (bank[spec.seed] ?? 0) - 1;
        if (bank[spec.seed] <= 0) delete bank[spec.seed];
      }
      const plots = s.plots.slice();
      plots[plotIndex] = { crop: cropId, growth: 0 };
      return { plots, bank };
    });
  },

  harvestPlot: (plotIndex) => {
    const s = get();
    const plot = s.plots[plotIndex];
    if (!plot?.crop) return;
    const spec = FARM_CROP_MAP[plot.crop];
    if (!spec || plot.growth < spec.growMs) return;
    const bank = { ...s.bank, [plot.crop]: (s.bank[plot.crop] ?? 0) + spec.yield };
    const plots = s.plots.slice();
    plots[plotIndex] = { crop: null, growth: 0 };
    const before = s.skills.farming?.xp ?? 0;
    const skills = { ...s.skills, farming: { xp: before + spec.xp } };
    set({ bank, plots, skills });
    get().flashXp("farming", spec.xp);
    toastLevelUp(get, before, before + spec.xp, "farming");
  },
});

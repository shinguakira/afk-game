import type { StateCreator } from "zustand";
import type { GameStore, EconomySlice } from "../types";
import { ITEM_MAP } from "../../constants/maps";
import { shopPrice } from "../../lib/economy";

export const createEconomySlice: StateCreator<GameStore, [], [], EconomySlice> = (set, get) => ({
  equip: (itemId) => {
    const it = ITEM_MAP[itemId];
    if (!it?.equip) return;
    if ((get().bank[itemId] ?? 0) <= 0) return;
    const slot = it.equip.slot;
    set((s) => {
      const bank = { ...s.bank };
      bank[itemId] = (bank[itemId] ?? 0) - 1;
      if (bank[itemId] <= 0) delete bank[itemId];
      const equipment = { ...s.equipment };
      const prev = equipment[slot];
      if (prev) bank[prev] = (bank[prev] ?? 0) + 1;
      equipment[slot] = itemId;
      return { bank, equipment };
    });
    get().pushLog(`${it.name} を装備`);
  },

  unequip: (slot) => {
    set((s) => {
      const cur = s.equipment[slot];
      if (!cur) return {};
      const bank = { ...s.bank };
      bank[cur] = (bank[cur] ?? 0) + 1;
      const equipment = { ...s.equipment };
      delete equipment[slot];
      return { bank, equipment };
    });
  },

  setFood: (itemId) => set({ selectedFood: itemId }),

  sell: (itemId, qty) => {
    const it = ITEM_MAP[itemId];
    if (!it) return;
    set((s) => {
      const have = s.bank[itemId] ?? 0;
      const n = Math.min(qty, have);
      if (n <= 0) return {};
      const bank = { ...s.bank };
      bank[itemId] = have - n;
      if (bank[itemId] <= 0) delete bank[itemId];
      return { bank, gold: s.gold + n * it.sellPrice };
    });
  },

  buyItem: (itemId, qty = 1) => {
    const it = ITEM_MAP[itemId];
    if (!it) return;
    const price = shopPrice(it.sellPrice);
    set((s) => {
      const n = Math.min(qty, Math.floor(s.gold / price));
      if (n <= 0) return {};
      const bank = { ...s.bank };
      bank[itemId] = (bank[itemId] ?? 0) + n;
      return { bank, gold: s.gold - n * price };
    });
  },
});

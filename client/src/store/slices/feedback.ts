import type { StateCreator } from "zustand";
import type { FeedbackSlice, GameStore } from "../types";
import { LOG_LIMIT, TOAST_MS, XP_FLASH_MS } from "../../constants/config";

let toastSeq = 0;
let xpFlashTimer: number | undefined;

export const createFeedbackSlice: StateCreator<GameStore, [], [], FeedbackSlice> = (set, get) => ({
  log: [],
  toasts: [],
  xpFlash: null,
  offlineSummary: null,

  pushLog: (msg) => set((s) => ({ log: [msg, ...s.log].slice(0, LOG_LIMIT) })),

  pushToast: (t) => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }].slice(-5) }));
    window.setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
      TOAST_MS,
    );
  },

  flashXp: (skillId, amount) => {
    if (amount <= 0) return;
    const cur = get().xpFlash;
    const acc = cur && cur.skillId === skillId ? cur.amount + amount : amount;
    set({ xpFlash: { skillId, amount: acc } });
    if (xpFlashTimer) clearTimeout(xpFlashTimer);
    xpFlashTimer = window.setTimeout(() => set({ xpFlash: null }), XP_FLASH_MS);
  },

  dismissOffline: () => set({ offlineSummary: null }),
});

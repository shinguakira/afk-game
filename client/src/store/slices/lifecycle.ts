import type { StateCreator } from "zustand";
import type { GameStore, LifecycleSlice } from "../types";
import type { OfflineSummary } from "../../types/offline";
import { SKILLS } from "../../constants/skills";
import { PLOT_COUNT } from "../../constants/farming";
import { simulateOffline } from "../../lib/progression";
import { deleteSave, flushSaveOnUnload, loadSave, writeSave } from "../../lib/persistence";
import { migrateSave } from "../../lib/migrate";
import { MAX_OFFLINE_MS, SAVE_EVERY_MS, SAVE_VERSION, TICK_MS } from "../../constants/config";
import { makeStartingState, pickSaveState } from "../state";

/** Guards against React StrictMode invoking init() (and its timers) twice in dev. */
let loopStarted = false;

export const createLifecycleSlice: StateCreator<GameStore, [], [], LifecycleSlice> = (
  set,
  get,
) => ({
  ready: false,

  init: async () => {
    const raw = await loadSave();
    // 旧バージョンは可能ならマイグレーション、無理なら破棄して新規開始。
    const loaded = migrateSave(raw);
    if (raw && !loaded) {
      console.warn(
        `[save] discarding unmigratable save (v${(raw as { version?: number }).version} -> v${SAVE_VERSION})`,
      );
    }
    const base = loaded ?? makeStartingState();
    // Merge in any skills added since the save was written.
    for (const s of SKILLS) base.skills[s.id] ??= { xp: 0 };
    base.plots ??= Array.from({ length: PLOT_COUNT }, () => ({ crop: null, growth: 0 }));

    let offlineSummary: OfflineSummary | null = null;
    const elapsed = Date.now() - (base.lastSaved ?? Date.now());
    // 能動作業が無くても、植えてある作物はオフラインで育てる（全体的に時間進行）。
    const hasCrops = base.plots?.some((p) => p.crop);
    if (loaded && elapsed > 3000 && (base.active || hasCrops)) {
      const sum = simulateOffline(base, Math.min(elapsed, MAX_OFFLINE_MS));
      if (base.active) offlineSummary = sum; // おかえりモーダルは能動作業があった時だけ
    }

    set({ ...base, offlineSummary, ready: true, enemyHp: 0 });

    if (loopStarted) return; // StrictMode double-mount: don't start a second loop
    loopStarted = true;

    // Game loop — uses real elapsed time so it stays accurate if a tick is late.
    let last = performance.now();
    window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(now - last, 5000);
      last = now;
      get().tick(dt);
    }, TICK_MS);

    // Periodic autosave + save on unload.
    window.setInterval(() => void get().saveNow(), SAVE_EVERY_MS);
    window.addEventListener("beforeunload", () => {
      flushSaveOnUnload(pickSaveState(get()));
    });
  },

  saveNow: async () => {
    await writeSave(pickSaveState(get()));
  },

  hardReset: async () => {
    await deleteSave();
    set({
      ...makeStartingState(),
      enemyHp: 0,
      playerTimer: 0,
      enemyTimer: 0,
      log: [],
      offlineSummary: null,
    });
  },
});

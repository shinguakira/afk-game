import { create } from "zustand";
import type { EquipSlot } from "../types/items";
import type { SaveState } from "../types/save";
import type { OfflineSummary } from "../types/offline";
import type { Toast, XpFlash } from "../types/ui";
import { ACTION_MAP, CLASS_MAP, ITEM_MAP, MONSTER_MAP, PRESTIGE_MAP } from "../constants/maps";
import { SKILLS } from "../constants/skills";
import { prestigeGain } from "../lib/prestige";
import { MILESTONES } from "../lib/roadmap";
import { levelForXp, xpForLevel } from "../lib/xp";
import { STARTING_MENTAL_LEVEL, STAT } from "../constants/skills";
import { FARM_CROP_MAP, PLOT_COUNT } from "../constants/farming";
import { TUTORIAL_STEPS } from "../constants/tutorial";
import { getCombatStats } from "../lib/combat";
import { simulateOffline } from "../lib/progression";
import { deleteSave, flushSaveOnUnload, loadSave, writeSave } from "../lib/persistence";
import { migrateSave } from "../lib/migrate";
import { advancePlots, runCombatTick, runSkillTick, toastLevelUp } from "../lib/tick";
import {
  HP_PER_MENTAL_LEVEL,
  LOG_LIMIT,
  MAX_OFFLINE_MS,
  ONBOARD_INTEREST_LEVEL,
  ONBOARD_MAIN_LEVEL,
  SAVE_EVERY_MS,
  SAVE_VERSION,
  SHOP_MARKUP,
  STARTING_BANK,
  STARTING_GOLD,
  TICK_MS,
  TOAST_MS,
  XP_FLASH_MS,
} from "../constants/config";

/** Guards against React StrictMode invoking init() (and its timers) twice in dev. */
let loopStarted = false;
let toastSeq = 0;
let xpFlashTimer: number | undefined;

// ---- helpers ----

/** ショップの購入価格（売値にマークアップ）。 */
export function shopPrice(sellPrice: number): number {
  return Math.max(1, Math.round(sellPrice * SHOP_MARKUP));
}

function makeStartingState(): SaveState {
  const skills: SaveState["skills"] = {};
  for (const s of SKILLS) skills[s.id] = { xp: 0 };
  skills[STAT.mental] = { xp: xpForLevel(STARTING_MENTAL_LEVEL) };
  const maxHp = STARTING_MENTAL_LEVEL * HP_PER_MENTAL_LEVEL;
  return {
    version: SAVE_VERSION,
    skills,
    bank: { ...STARTING_BANK },
    gold: STARTING_GOLD,
    jobClass: null,
    prestigePoints: 0,
    prestigeUpgrades: {},
    prestigeCount: 0,
    milestones: [],
    equipment: {},
    selectedFood: "coffee",
    playerName: "",
    mainLang: null,
    interestLangs: [],
    onboarded: false,
    playerHp: maxHp,
    active: null,
    actionProgress: 0,
    plots: Array.from({ length: PLOT_COUNT }, () => ({ crop: null, growth: 0 })),
    lastSaved: Date.now(),
  };
}

function pickSaveState(s: GameStore): SaveState {
  return {
    version: SAVE_VERSION,
    skills: s.skills,
    bank: s.bank,
    gold: s.gold,
    jobClass: s.jobClass,
    prestigePoints: s.prestigePoints,
    prestigeUpgrades: s.prestigeUpgrades,
    prestigeCount: s.prestigeCount,
    milestones: s.milestones,
    equipment: s.equipment,
    selectedFood: s.selectedFood,
    playerName: s.playerName,
    mainLang: s.mainLang,
    interestLangs: s.interestLangs,
    onboarded: s.onboarded,
    playerHp: s.playerHp,
    active: s.active,
    actionProgress: s.actionProgress,
    plots: s.plots,
    lastSaved: Date.now(),
  };
}

// ---- store shape ----

export interface GameStore extends SaveState {
  // transient (not persisted)
  enemyHp: number;
  playerTimer: number;
  enemyTimer: number;
  log: string[];
  toasts: Toast[];
  xpFlash: XpFlash | null;
  offlineSummary: OfflineSummary | null;
  ready: boolean;
  /** チュートリアルの現在ステップ。-1 = 非表示。 */
  tutorialStep: number;

  init: () => Promise<void>;
  completeOnboarding: (name: string, mainLang: string, interestLangs: string[]) => void;
  setTutorialStep: (n: number) => void;
  endTutorial: () => void;
  restartTutorial: () => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  flashXp: (skillId: string, amount: number) => void;
  tick: (dt: number) => void;
  startAction: (actionId: string) => void;
  startCombat: (monsterId: string) => void;
  stop: () => void;
  equip: (itemId: string) => void;
  unequip: (slot: EquipSlot) => void;
  setFood: (itemId: string | null) => void;
  setClass: (classId: string) => void;
  prestige: () => void;
  buyPrestigeUpgrade: (id: string) => void;
  checkRoadmap: () => void;
  sell: (itemId: string, qty: number) => void;
  buyItem: (itemId: string, qty?: number) => void;
  plantCrop: (plotIndex: number, cropId: string) => void;
  harvestPlot: (plotIndex: number) => void;
  saveNow: () => Promise<void>;
  hardReset: () => Promise<void>;
  dismissOffline: () => void;
  pushLog: (msg: string) => void;
}

export const useGame = create<GameStore>((set, get) => ({
  ...makeStartingState(),
  enemyHp: 0,
  playerTimer: 0,
  enemyTimer: 0,
  log: [],
  toasts: [],
  xpFlash: null,
  offlineSummary: null,
  ready: false,
  tutorialStep: -1,

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

  // 初回オンボーディング確定: 名前・得意/興味言語を保存し、得意言語に開始ブースト。
  completeOnboarding: (name, mainLang, interestLangs) => {
    const s = get();
    const skills = { ...s.skills };
    if (mainLang && skills[mainLang]) {
      // 得意言語はフレームワーク解禁手前までブースト。
      skills[mainLang] = { xp: Math.max(skills[mainLang].xp, xpForLevel(ONBOARD_MAIN_LEVEL)) };
    }
    for (const id of interestLangs) {
      if (id !== mainLang && skills[id]) {
        skills[id] = { xp: Math.max(skills[id].xp, xpForLevel(ONBOARD_INTEREST_LEVEL)) };
      }
    }
    set({
      playerName: name.trim() || "名無しエンジニア",
      mainLang,
      interestLangs,
      onboarded: true,
      skills,
      tutorialStep: 0, // 続けてチュートリアル開始
    });
    void get().saveNow();
  },

  setTutorialStep: (n) => {
    if (n < 0 || n >= TUTORIAL_STEPS.length) {
      get().endTutorial();
      return;
    }
    set({ tutorialStep: n });
  },
  endTutorial: () => set({ tutorialStep: -1 }),
  restartTutorial: () => set({ tutorialStep: 0 }),

  tick: (dt) => {
    const s = get();
    if (!s.ready) return;
    if (s.active?.kind === "skill") runSkillTick(set, get, dt);
    else if (s.active?.kind === "combat") runCombatTick(set, get, dt);
    advancePlots(set, get, dt); // 作物は active と独立に放置で育つ
    get().checkRoadmap();
  },

  startAction: (actionId) => {
    const action = ACTION_MAP[actionId];
    if (!action) return;
    set({
      active: { kind: "skill", actionId },
      actionProgress: 0,
      enemyHp: 0,
    });
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

  stop: () => {
    set({ active: null, actionProgress: 0, enemyHp: 0 });
  },

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
      if (prev) bank[prev] = (bank[prev] ?? 0) + 1; // swap old back to bank
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
    // Reset run progress; keep永続(ストック/アップグレード/回数).
    set({
      ...makeStartingState(),
      prestigePoints: s.prestigePoints + gain,
      prestigeUpgrades: s.prestigeUpgrades,
      prestigeCount: s.prestigeCount + 1,
      milestones: s.milestones, // 達成済みマイルストーンは永続
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

  // 畑に作物を植える（farming Lv・空き畑・種を満たす）。種を消費。以後は放置で育つ。
  // パースニップ(seed未指定)のみ種不要。
  plantCrop: (plotIndex, cropId) => {
    set((s) => {
      const spec = FARM_CROP_MAP[cropId];
      const plot = s.plots[plotIndex];
      if (!spec || !plot || plot.crop) return {};
      if (levelForXp(s.skills.farming?.xp ?? 0) < spec.level) return {};
      let bank = s.bank;
      if (spec.seed) {
        if ((s.bank[spec.seed] ?? 0) < 1) return {}; // 種が無い
        bank = { ...s.bank };
        bank[spec.seed] = (bank[spec.seed] ?? 0) - 1;
        if (bank[spec.seed] <= 0) delete bank[spec.seed];
      }
      const plots = s.plots.slice();
      plots[plotIndex] = { crop: cropId, growth: 0 };
      return { plots, bank };
    });
  },

  // 育ちきった畑を収穫（作物アイテム＋farming XP）。畑は空に戻る。
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

  dismissOffline: () => set({ offlineSummary: null }),
}));

// Dev-only debug handle for tinkering from the console.
if (import.meta.env.DEV) {
  (window as unknown as { __game: typeof useGame }).__game = useGame;
}

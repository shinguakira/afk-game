import { create } from "zustand";
import type {
  ActionId,
  EquipSlot,
  ItemId,
  MonsterId,
  OfflineSummary,
  SaveState,
} from "./types";
import {
  ACTION_MAP,
  CLASS_MAP,
  COMBAT_STAT_IDS,
  isCraftAction,
  ITEM_MAP,
  MONSTER_MAP,
  SKILL_MAP,
  SKILLS,
} from "./data";
import { getEffects } from "./effects";
import { mult } from "./modifiers";
import { prestigeGain } from "./prestige";
import { MILESTONES } from "./roadmap";
import { PRESTIGE_MAP } from "./data";
import { levelForXp, xpForLevel } from "./xp";
import { STARTING_MENTAL_LEVEL, STAT } from "./data/skills";
import {
  enemyHitChance,
  getCombatStats,
  playerHitChance,
} from "./combat";
import { grantCombatXp, simulateOffline } from "./progression";
import {
  deleteSave,
  flushSaveOnUnload,
  loadSave,
  writeSave,
} from "./persistence";

// Bump whenever the save schema changes incompatibly (e.g. skill ids renamed).
// On mismatch we discard the old save and start fresh (no migrations yet).
const SAVE_VERSION = 15;
const TICK_MS = 100;
/** Guards against React StrictMode invoking init() (and its timers) twice in dev. */
let loopStarted = false;
let toastSeq = 0;
const TOAST_MS = 4200;
let xpFlashTimer: number | undefined;
const XP_FLASH_MS = 3500;

export interface Toast {
  id: number;
  text: string;
  icon?: string;
  kind?: "level" | "goal" | "info";
}

/** 直近のXP獲得インジケータ（同じスキルなら加算、しばらく無獲得で消える）。 */
export interface XpFlash {
  skillId: string;
  amount: number;
}
const SAVE_EVERY_MS = 15_000;
const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000; // 24h cap, like Melvor
const LOG_LIMIT = 40;

// ---- helpers ----

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** ショップの購入価格（売値にマークアップ）。 */
export function shopPrice(sellPrice: number): number {
  return Math.max(1, Math.round(sellPrice * 2));
}

function makeStartingState(): SaveState {
  const skills: SaveState["skills"] = {};
  for (const s of SKILLS) skills[s.id] = { xp: 0 };
  skills[STAT.mental] = { xp: xpForLevel(STARTING_MENTAL_LEVEL) };
  const maxHp = STARTING_MENTAL_LEVEL * 10;
  return {
    version: SAVE_VERSION,
    skills,
    bank: { coffee: 10 },
    gold: 25,
    jobClass: null,
    prestigePoints: 0,
    prestigeUpgrades: {},
    prestigeCount: 0,
    milestones: [],
    equipment: {},
    selectedFood: "coffee",
    playerHp: maxHp,
    active: null,
    actionProgress: 0,
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
    playerHp: s.playerHp,
    active: s.active,
    actionProgress: s.actionProgress,
    lastSaved: Date.now(),
  };
}

// ---- store shape ----

interface GameStore extends SaveState {
  // transient (not persisted)
  enemyHp: number;
  playerTimer: number;
  enemyTimer: number;
  log: string[];
  toasts: Toast[];
  xpFlash: XpFlash | null;
  offlineSummary: OfflineSummary | null;
  ready: boolean;

  init: () => Promise<void>;
  pushToast: (t: Omit<Toast, "id">) => void;
  flashXp: (skillId: string, amount: number) => void;
  tick: (dt: number) => void;
  startAction: (actionId: ActionId) => void;
  startCombat: (monsterId: MonsterId) => void;
  stop: () => void;
  equip: (itemId: ItemId) => void;
  unequip: (slot: EquipSlot) => void;
  setFood: (itemId: ItemId | null) => void;
  setClass: (classId: string) => void;
  prestige: () => void;
  buyPrestigeUpgrade: (id: string) => void;
  checkRoadmap: () => void;
  sell: (itemId: ItemId, qty: number) => void;
  buyItem: (itemId: ItemId, qty?: number) => void;
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

  pushLog: (msg) =>
    set((s) => ({ log: [msg, ...s.log].slice(0, LOG_LIMIT) })),

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
    // Discard incompatible saves from before a schema change.
    const loaded = raw && raw.version === SAVE_VERSION ? raw : null;
    if (raw && !loaded) {
      console.warn(
        `[save] discarding incompatible save (v${raw.version} != v${SAVE_VERSION})`,
      );
    }
    const base = loaded ?? makeStartingState();
    // Merge in any skills added since the save was written.
    for (const s of SKILLS) base.skills[s.id] ??= { xp: 0 };

    let offlineSummary: OfflineSummary | null = null;
    const elapsed = Date.now() - (base.lastSaved ?? Date.now());
    if (loaded && base.active && elapsed > 3000) {
      offlineSummary = simulateOffline(base, Math.min(elapsed, MAX_OFFLINE_MS));
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

  tick: (dt) => {
    const s = get();
    if (!s.ready) return;
    if (s.active?.kind === "skill") runSkillTick(set, get, dt);
    else if (s.active?.kind === "combat") runCombatTick(set, get, dt);
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
    get().pushLog(
      `🚀 独立して起業！ ストック +${gain}（通算 ${s.prestigeCount + 1} 回）`,
    );
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

// ---- tick implementations ----

type SetFn = (partial: Partial<GameStore>) => void;
type GetFn = () => GameStore;

/** スキルがレベルアップしていたらトーストを出す。 */
function toastLevelUp(
  get: GetFn,
  oldXp: number,
  newXp: number,
  skillId: string,
): void {
  const before = levelForXp(oldXp);
  const after = levelForXp(newXp);
  if (after > before) {
    const sk = SKILL_MAP[skillId];
    get().pushToast({
      text: `${sk?.name ?? skillId} が Lv${after} に！`,
      icon: sk?.icon,
      kind: "level",
    });
  }
}

function runSkillTick(set: SetFn, get: GetFn, dt: number): void {
  const s = get();
  if (s.active?.kind !== "skill") return;
  const action = ACTION_MAP[s.active.actionId];
  if (!action) {
    set({ active: null });
    return;
  }

  // 入力を消費するアクション(framework/料理/PC組み立て)は制作補正、それ以外は生産補正。
  const eff = getEffects(s);
  const craft = isCraftAction(action);
  const speedKey = craft ? "speed.craft" : "speed.gather";
  const xpKey = craft ? "xp.craft" : "xp.gather";
  const effTime = action.time / mult(eff, speedKey);
  const xpPer = action.xp * mult(eff, xpKey);

  let progress = s.actionProgress + dt;
  const bank = { ...s.bank };
  let xpGained = 0;
  let completions = 0;
  let stopped = false;
  let guard = 1000;

  while (progress >= effTime && guard-- > 0) {
    // Craft actions need their inputs available.
    if (action.inputs) {
      const ok = Object.entries(action.inputs).every(
        ([id, q]) => (bank[id] ?? 0) >= (q as number),
      );
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
  const alsoXp =
    also && completions > 0 ? completions * also.xp * mult(eff, xpKey) : 0;

  let skills =
    xpGained > 0
      ? {
          ...s.skills,
          [action.skill]: {
            xp: (s.skills[action.skill]?.xp ?? 0) + xpGained,
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
    get().flashXp(action.skill, Math.round(xpGained));
    toastLevelUp(
      get,
      s.skills[action.skill]?.xp ?? 0,
      skills[action.skill]?.xp ?? 0,
      action.skill,
    );
  }
  if (also && alsoXp > 0) {
    get().flashXp(also.skill, Math.round(alsoXp));
    toastLevelUp(
      get,
      s.skills[also.skill]?.xp ?? 0,
      skills[also.skill]?.xp ?? 0,
      also.skill,
    );
  }
  if (stopped) get().pushLog(`素材切れ: ${action.name}`);
}

function runCombatTick(set: SetFn, get: GetFn, dt: number): void {
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
        enemyHp -= randInt(1, stats.maxHit);
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
        logs.push(`${monster.name} を解決！ (+${Math.round(monster.xp * combatXpMult)} xp)`);
        enemyHp = monster.hp; // respawn next target
      }
    } else if (enemyReady) {
      enemyTimer -= monster.speed;
      if (Math.random() < enemyHitChance(stats, monster)) {
        playerHp -= randInt(1, monster.maxHit);
      }
      // Auto-eat below half HP.
      if (
        playerHp <= stats.maxHp * 0.5 &&
        s.selectedFood &&
        (bank[s.selectedFood] ?? 0) > 0
      ) {
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

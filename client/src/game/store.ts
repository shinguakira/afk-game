import { create } from "zustand";
import type {
  ActionId,
  ItemId,
  MonsterId,
  OfflineSummary,
  SaveState,
} from "./types";
import {
  ACTION_MAP,
  CLASS_MAP,
  ITEM_MAP,
  MONSTER_MAP,
  SKILL_MAP,
  SKILLS,
} from "./data";
import { getEffects } from "./effects";
import { mult } from "./modifiers";
import { advanceSubordinates, hireCost, SUB_NAMES } from "./team";
import { currentRank, maxSubordinates } from "./rank";
import { xpForLevel } from "./xp";
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
const SAVE_VERSION = 4;
const TICK_MS = 100;
/** Guards against React StrictMode invoking init() (and its timers) twice in dev. */
let loopStarted = false;
const SAVE_EVERY_MS = 15_000;
const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000; // 24h cap, like Melvor
const LOG_LIMIT = 40;

// ---- helpers ----

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
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
    subordinates: [],
    equippedWeapon: null,
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
    subordinates: s.subordinates,
    equippedWeapon: s.equippedWeapon,
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
  offlineSummary: OfflineSummary | null;
  ready: boolean;

  init: () => Promise<void>;
  tick: (dt: number) => void;
  startAction: (actionId: ActionId) => void;
  startCombat: (monsterId: MonsterId) => void;
  stop: () => void;
  equip: (itemId: ItemId) => void;
  unequip: () => void;
  setFood: (itemId: ItemId | null) => void;
  setClass: (classId: string) => void;
  hireSubordinate: () => void;
  assignSubordinate: (id: string, actionId: ActionId | null) => void;
  fireSubordinate: (id: string) => void;
  sell: (itemId: ItemId, qty: number) => void;
  buyFood: (itemId: ItemId, qty: number) => void;
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
  offlineSummary: null,
  ready: false,

  pushLog: (msg) =>
    set((s) => ({ log: [msg, ...s.log].slice(0, LOG_LIMIT) })),

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
    // Player's own action.
    if (s.active?.kind === "skill") runSkillTick(set, get, dt);
    else if (s.active?.kind === "combat") runCombatTick(set, get, dt);
    // Subordinates work in parallel (independent of the player's action).
    if (s.subordinates.length) runSubordinatesTick(set, get, dt);
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
    if (!it?.weapon) return;
    if ((get().bank[itemId] ?? 0) <= 0) return;
    // return current weapon to bank, take the new one out
    set((s) => {
      const bank = { ...s.bank };
      bank[itemId] = (bank[itemId] ?? 0) - 1;
      if (bank[itemId] <= 0) delete bank[itemId];
      if (s.equippedWeapon) bank[s.equippedWeapon] = (bank[s.equippedWeapon] ?? 0) + 1;
      return { bank, equippedWeapon: itemId };
    });
    get().pushLog(`${it.name} を装備`);
  },

  unequip: () => {
    set((s) => {
      if (!s.equippedWeapon) return {};
      const bank = { ...s.bank };
      bank[s.equippedWeapon] = (bank[s.equippedWeapon] ?? 0) + 1;
      return { bank, equippedWeapon: null };
    });
  },

  setFood: (itemId) => set({ selectedFood: itemId }),

  setClass: (classId) => {
    set({ jobClass: classId });
    get().pushLog(`職種を変更: ${CLASS_MAP[classId]?.name ?? classId}`);
  },

  hireSubordinate: () => {
    const s = get();
    const cap = maxSubordinates(currentRank(s).index);
    if (s.subordinates.length >= cap) {
      get().pushLog(
        cap === 0 ? "ミドル昇進で部下を採用できます" : "採用枠が一杯です",
      );
      return;
    }
    const cost = hireCost(s.subordinates.length);
    if (s.gold < cost) {
      get().pushLog(`採用費 ¥${cost} が足りません`);
      return;
    }
    const name = SUB_NAMES[s.subordinates.length % SUB_NAMES.length];
    const id =
      (globalThis.crypto?.randomUUID?.() ?? `sub_${s.subordinates.length}`) +
      `_${s.subordinates.length}`;
    set({
      gold: s.gold - cost,
      subordinates: [
        ...s.subordinates,
        { id, name, xp: 0, assignment: null, progress: 0 },
      ],
    });
    get().pushLog(`${name} を採用 (¥${cost})`);
  },

  assignSubordinate: (id, actionId) => {
    set((st) => ({
      subordinates: st.subordinates.map((sub) =>
        sub.id === id ? { ...sub, assignment: actionId, progress: 0 } : sub,
      ),
    }));
  },

  fireSubordinate: (id) => {
    set((st) => ({
      subordinates: st.subordinates.filter((sub) => sub.id !== id),
    }));
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

  buyFood: (itemId, qty) => {
    const it = ITEM_MAP[itemId];
    if (!it || it.type !== "food") return;
    const price = it.sellPrice * 3; // buy markup
    set((s) => {
      const affordable = Math.min(qty, Math.floor(s.gold / price));
      if (affordable <= 0) return {};
      const bank = { ...s.bank };
      bank[itemId] = (bank[itemId] ?? 0) + affordable;
      return { bank, gold: s.gold - affordable * price };
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

  dismissOffline: () => set({ offlineSummary: null }),
}));

// Dev-only debug handle for tinkering from the console.
if (import.meta.env.DEV) {
  (window as unknown as { __game: typeof useGame }).__game = useGame;
}

// ---- tick implementations ----

type SetFn = (partial: Partial<GameStore>) => void;
type GetFn = () => GameStore;

function runSkillTick(set: SetFn, get: GetFn, dt: number): void {
  const s = get();
  if (s.active?.kind !== "skill") return;
  const action = ACTION_MAP[s.active.actionId];
  if (!action) {
    set({ active: null });
    return;
  }

  // Apply job-class speed/xp modifiers for this skill's kind.
  const eff = getEffects(s);
  const kind = SKILL_MAP[action.skill]?.kind;
  const speedKey = kind === "craft" ? "speed.craft" : "speed.gather";
  const xpKey = kind === "craft" ? "xp.craft" : "xp.gather";
  const effTime = action.time / mult(eff, speedKey);
  const xpPer = action.xp * mult(eff, xpKey);

  let progress = s.actionProgress + dt;
  const bank = { ...s.bank };
  let xpGained = 0;
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
    progress -= effTime;
  }

  const skills =
    xpGained > 0
      ? {
          ...s.skills,
          [action.skill]: {
            xp: (s.skills[action.skill]?.xp ?? 0) + xpGained,
          },
        }
      : s.skills;

  set({ bank, skills, actionProgress: progress, active: stopped ? null : s.active });
  if (stopped) get().pushLog(`素材切れ: ${action.name}`);
}

function runSubordinatesTick(set: SetFn, get: GetFn, dt: number): void {
  const s = get();
  const eff = getEffects(s);
  const { bank, subordinates } = advanceSubordinates(
    s.subordinates,
    s.bank,
    dt,
    eff,
  );
  set({ bank, subordinates });
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
}

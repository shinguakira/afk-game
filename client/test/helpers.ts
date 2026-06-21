import { vi } from "vitest";
import type { SaveState } from "@/types/save";
import type { GameStore } from "@/store/types";
import type { GetFn, SetFn } from "@/lib/tick";
import { xpForLevel } from "@/lib/xp";
import { SKILLS } from "@/constants/skills";
import { SAVE_VERSION } from "@/constants/config";

export function freshState(over: Partial<SaveState> = {}): SaveState {
  return {
    version: SAVE_VERSION,
    skills: {},
    bank: {},
    gold: 0,
    jobClass: null,
    prestigePoints: 0,
    prestigeUpgrades: {},
    prestigeCount: 0,
    milestones: [],
    equipment: {},
    selectedFood: null,
    playerName: "",
    mainLang: null,
    interestLangs: [],
    onboarded: true,
    playerHp: 100,
    active: null,
    actionProgress: 0,
    plots: [],
    lastSaved: 0,
    ...over,
  };
}

/** Build a state with specific skills at given levels; others default to Lv1. */
export function withSkills(
  levels: Record<string, number>,
  over: Partial<SaveState> = {},
): SaveState {
  const skills: SaveState["skills"] = {};
  for (const [id, lv] of Object.entries(levels)) {
    skills[id] = { xp: xpForLevel(lv) };
  }
  return freshState({ skills, ...over });
}

/**
 * Build a state whose totalLevel() is exactly `target`.
 * Distributes extra levels over SKILLS in order (max Lv99 each).
 */
export function stateForTotal(target: number): SaveState {
  const N = SKILLS.length;
  const skills: SaveState["skills"] = {};
  // Each un-set skill defaults to Lv1.
  // extra = levels we need to add above the N×Lv1 baseline.
  let extra = target - N;
  for (const skill of SKILLS) {
    if (extra <= 0) break;
    const add = Math.min(98, extra); // each skill max is Lv99 (98 above Lv1)
    skills[skill.id] = { xp: xpForLevel(1 + add) };
    extra -= add;
  }
  return freshState({ skills });
}

/** Minimal GameStore mock for tick-function tests. */
export function mockStore(save: Partial<SaveState> = {}): { get: GetFn; set: SetFn } {
  let state = {
    ...freshState(save),
    log: [] as string[],
    toasts: [],
    xpFlash: null,
    offlineSummary: null,
    pushLog: vi.fn(),
    pushToast: vi.fn(),
    flashXp: vi.fn(),
    dismissOffline: vi.fn(),
    ready: true,
    init: vi.fn(),
    saveNow: vi.fn(),
    hardReset: vi.fn(),
    tutorialStep: -1,
    completeOnboarding: vi.fn(),
    setTutorialStep: vi.fn(),
    endTutorial: vi.fn(),
    restartTutorial: vi.fn(),
    enemyHp: 0,
    playerTimer: 0,
    enemyTimer: 0,
    tick: vi.fn(),
    startAction: vi.fn(),
    startCombat: vi.fn(),
    stop: vi.fn(),
    equip: vi.fn(),
    unequip: vi.fn(),
    setFood: vi.fn(),
    sell: vi.fn(),
    buyItem: vi.fn(),
    setClass: vi.fn(),
    prestige: vi.fn(),
    buyPrestigeUpgrade: vi.fn(),
    checkRoadmap: vi.fn(),
    plantCrop: vi.fn(),
    harvestPlot: vi.fn(),
  } as unknown as GameStore;

  const get: GetFn = () => state;
  const set: SetFn = (partial) => {
    state = { ...state, ...partial };
  };
  return { get, set };
}

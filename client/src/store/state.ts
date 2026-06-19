// 永続セーブ状態のファクトリ。新規開始状態の生成と、現在ストアからの SaveState 抽出。
import type { SaveState } from "../types/save";
import { SKILLS, STARTING_MENTAL_LEVEL, STAT } from "../constants/skills";
import { PLOT_COUNT } from "../constants/farming";
import { xpForLevel } from "../lib/xp";
import {
  HP_PER_MENTAL_LEVEL,
  SAVE_VERSION,
  STARTING_BANK,
  STARTING_GOLD,
} from "../constants/config";
import type { GameStore } from "./types";

export function makeStartingState(): SaveState {
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

export function pickSaveState(s: GameStore): SaveState {
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

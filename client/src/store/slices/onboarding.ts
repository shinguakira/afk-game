import type { StateCreator } from "zustand";
import type { GameStore, OnboardingSlice } from "../types";
import { TUTORIAL_STEPS } from "../../constants/tutorial";
import { xpForLevel } from "../../lib/xp";
import { ONBOARD_INTEREST_LEVEL, ONBOARD_MAIN_LEVEL } from "../../constants/config";

export const createOnboardingSlice: StateCreator<GameStore, [], [], OnboardingSlice> = (
  set,
  get,
) => ({
  tutorialStep: -1,

  completeOnboarding: (name, mainLang, interestLangs) => {
    const s = get();
    const skills = { ...s.skills };
    if (mainLang && skills[mainLang]) {
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
      tutorialStep: 0,
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
});

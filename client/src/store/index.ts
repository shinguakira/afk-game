import { create } from "zustand";
import type { GameStore } from "@/store/types";
import { makeStartingState } from "@/store/state";
import { createFeedbackSlice } from "@/store/slices/feedback";
import { createLifecycleSlice } from "@/store/slices/lifecycle";
import { createOnboardingSlice } from "@/store/slices/onboarding";
import { createLoopSlice } from "@/store/slices/loop";
import { createEconomySlice } from "@/store/slices/economy";
import { createCareerSlice } from "@/store/slices/career";
import { createFarmingSlice } from "@/store/slices/farming";

export { shopPrice } from "@/lib/economy";
export type { GameStore } from "@/store/types";

export const useGame = create<GameStore>((set, get, api) => ({
  ...makeStartingState(),
  ...createFeedbackSlice(set, get, api),
  ...createLifecycleSlice(set, get, api),
  ...createOnboardingSlice(set, get, api),
  ...createLoopSlice(set, get, api),
  ...createEconomySlice(set, get, api),
  ...createCareerSlice(set, get, api),
  ...createFarmingSlice(set, get, api),
}));

// Dev-only debug handle for tinkering from the console.
if (import.meta.env.DEV) {
  (window as unknown as { __game: typeof useGame }).__game = useGame;
}

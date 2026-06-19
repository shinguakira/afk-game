import { create } from "zustand";
import type { GameStore } from "./types";
import { makeStartingState } from "./state";
import { createFeedbackSlice } from "./slices/feedback";
import { createLifecycleSlice } from "./slices/lifecycle";
import { createOnboardingSlice } from "./slices/onboarding";
import { createLoopSlice } from "./slices/loop";
import { createEconomySlice } from "./slices/economy";
import { createCareerSlice } from "./slices/career";
import { createFarmingSlice } from "./slices/farming";

export { shopPrice } from "../lib/economy";
export type { GameStore } from "./types";

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

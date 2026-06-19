// store の型定義。永続セーブ(SaveState)に責務別スライスを合成して GameStore を作る。
// 各スライスは「自分の transient state + actions」を 1 インターフェースで宣言する。
import type { EquipSlot } from "@/types/items";
import type { SaveState } from "@/types/save";
import type { OfflineSummary } from "@/types/offline";
import type { Toast, XpFlash } from "@/types/ui";

/** ログ/トースト/XPフラッシュ/おかえりモーダル等の UI フィードバック。 */
export interface FeedbackSlice {
  log: string[];
  toasts: Toast[];
  xpFlash: XpFlash | null;
  offlineSummary: OfflineSummary | null;
  pushLog: (msg: string) => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  flashXp: (skillId: string, amount: number) => void;
  dismissOffline: () => void;
}

/** セーブ読込・ゲームループ起動・保存・初期化。 */
export interface LifecycleSlice {
  ready: boolean;
  init: () => Promise<void>;
  saveNow: () => Promise<void>;
  hardReset: () => Promise<void>;
}

/** 初回オンボーディングとチュートリアル進行。 */
export interface OnboardingSlice {
  /** チュートリアルの現在ステップ。-1 = 非表示。 */
  tutorialStep: number;
  completeOnboarding: (name: string, mainLang: string, interestLangs: string[]) => void;
  setTutorialStep: (n: number) => void;
  endTutorial: () => void;
  restartTutorial: () => void;
}

/** 毎tickの進行と、アクション/戦闘の開始・停止。 */
export interface LoopSlice {
  enemyHp: number;
  playerTimer: number;
  enemyTimer: number;
  tick: (dt: number) => void;
  startAction: (actionId: string) => void;
  startCombat: (monsterId: string) => void;
  stop: () => void;
}

/** 所持品・装備・売買。 */
export interface EconomySlice {
  equip: (itemId: string) => void;
  unequip: (slot: EquipSlot) => void;
  setFood: (itemId: string | null) => void;
  sell: (itemId: string, qty: number) => void;
  buyItem: (itemId: string, qty?: number) => void;
}

/** 職種・起業(prestige)・ロードマップ達成。 */
export interface CareerSlice {
  setClass: (classId: string) => void;
  prestige: () => void;
  buyPrestigeUpgrade: (id: string) => void;
  checkRoadmap: () => void;
}

/** 農業: 植える・収穫する（放置成長は LoopSlice 側）。 */
export interface FarmingSlice {
  plantCrop: (plotIndex: number, cropId: string) => void;
  harvestPlot: (plotIndex: number) => void;
}

export type GameStore = SaveState &
  FeedbackSlice &
  LifecycleSlice &
  OnboardingSlice &
  LoopSlice &
  EconomySlice &
  CareerSlice &
  FarmingSlice;

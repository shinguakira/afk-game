import type { ActionId, ItemId, MonsterId, SkillId } from "./ids";
import type { EquipSlot } from "./items";

export type ActiveAction =
  | { kind: "skill"; actionId: ActionId }
  | { kind: "combat"; monsterId: MonsterId }
  | null;

/** 農業の畑1区画。作物を植えると growth(ms) が経過時間で増え、growMs で収穫可。
 *  作物の成長は放置で進む（能動アクションとは独立）。手入れ中は成長が加速する。 */
export interface PlotState {
  crop: ItemId | null;
  growth: number;
}

export interface SaveState {
  version: number;
  skills: Record<SkillId, { xp: number }>;
  bank: Record<ItemId, number>;
  /** 農業の畑（放置で育つ）。 */
  plots: PlotState[];
  gold: number;
  /** 選択中の職種クラス id（null = 無所属）。補正の源。 */
  jobClass: string | null;
  /** 起業(プレステージ)で得る永続通貨「ストック」。 */
  prestigePoints: number;
  /** 永続アップグレード id → 取得レベル。 */
  prestigeUpgrades: Record<string, number>;
  /** 起業した回数。 */
  prestigeCount: number;
  /** 達成済みマイルストーン id（キャリア・ロードマップ）。 */
  milestones: string[];
  /** スロット → 装備中アイテム id。 */
  equipment: Partial<Record<EquipSlot, ItemId>>;
  selectedFood: ItemId | null;
  /** プレイヤー名（オンボーディングで入力）。 */
  playerName: string;
  /** 得意な言語id（開始時ブースト）。 */
  mainLang: string | null;
  /** 興味のある言語id（少量ブースト＋サイドバーで強調）。 */
  interestLangs: string[];
  /** 初回オンボーディング完了済みか。 */
  onboarded: boolean;
  playerHp: number;
  active: ActiveAction;
  /** Carry-over progress on the current skill action (ms). */
  actionProgress: number;
  lastSaved: number;
}

export interface OfflineSummary {
  ms: number;
  xp: Record<SkillId, number>;
  items: Record<ItemId, number>;
  gold: number;
}

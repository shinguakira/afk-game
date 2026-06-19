// ============================================================================
// 永続セーブデータのスキーマ（これがディスク/localStorage に書き出される構造）。
// ----------------------------------------------------------------------------
// ここを変更したら `constants/config.ts` の SAVE_VERSION を必ず上げること。
// バージョン不一致のセーブは現状 init() で破棄しているが、将来はこのスキーマを
// 対象にマイグレーション（旧版 → 現行 SaveState へ変換）を書く前提。
// マイグレーションが書きやすいよう、永続フィールドはこのファイルに閉じておく
// （実行時/UIの一時状態や OfflineSummary などの非永続DTOは混ぜない）。
// ============================================================================
import type { EquipSlot } from "./items";

/** 進行中の作業。null=待機。 */
export type ActiveAction =
  | { kind: "skill"; actionId: string }
  | { kind: "combat"; monsterId: string }
  | null;

/** 農業の畑1区画。作物を植えると growth(ms) が経過時間で増え、growMs で収穫可。
 *  作物の成長は放置で進む（能動アクションとは独立）。手入れ中は成長が加速する。 */
export interface PlotState {
  crop: string | null;
  growth: number;
}

/** ディスクに永続化されるゲーム状態。`version` でスキーマ世代を管理する。 */
export interface SaveState {
  /** スキーマ世代。constants/config.ts の SAVE_VERSION と一致する時のみロード（不一致は破棄/将来はマイグレーション）。 */
  version: number;
  skills: Record<string, { xp: number }>;
  bank: Record<string, number>;
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
  equipment: Partial<Record<EquipSlot, string>>;
  selectedFood: string | null;
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

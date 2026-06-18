// ゲームエンジンの調整用定数を一箇所に集約（散在していた数値を定数化）。
import type { ItemId } from "../types/ids";

// ---- セーブ / ループ ----
/** セーブ構造を非互換に変えたら上げる。不一致なら旧セーブを破棄して新規開始。 */
export const SAVE_VERSION = 19;
/** ゲームループのtick間隔(ms)。 */
export const TICK_MS = 100;
/** 自動セーブ間隔(ms)。 */
export const SAVE_EVERY_MS = 15_000;
/** オフライン進行の上限(ms)。Melvor 同様 24h でキャップ。 */
export const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000;
/** ログの保持件数。 */
export const LOG_LIMIT = 40;

// ---- 通知 ----
/** トーストの自動消滅時間(ms)。 */
export const TOAST_MS = 4200;
/** XP獲得インジケータの表示時間(ms)。 */
export const XP_FLASH_MS = 3500;

// ---- 経済 / 初期値 ----
/** ショップ購入価格 = 売値 × このマークアップ。 */
export const SHOP_MARKUP = 2;
/** 開始時の所持金。 */
export const STARTING_GOLD = 25;
/** 開始時の所持アイテム。 */
export const STARTING_BANK: Record<ItemId, number> = { coffee: 10 };
/** メンタルLv1あたりの最大HP。 */
export const HP_PER_MENTAL_LEVEL = 10;

// ---- オンボーディング ----
/** 得意言語の開始ブースト到達Lv（フレームワーク解禁手前）。 */
export const ONBOARD_MAIN_LEVEL = 5;
/** 興味言語の開始ブースト到達Lv。 */
export const ONBOARD_INTEREST_LEVEL = 2;

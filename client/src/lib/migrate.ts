// セーブのスキーマ・マイグレーション。
// 旧バージョンのセーブを順次 1世代ずつ現行 SaveState(version=SAVE_VERSION) まで変換する。
// スキーマ(types/save.ts)を変えて SAVE_VERSION を上げたら、ここに「旧version → +1」の
// 変換ステップを1つ足す。経路が無い古さ/未来のセーブは null（= 破棄して新規開始）。
import type { SaveState } from "../types/save";
import { SAVE_VERSION } from "../constants/config";

/** マイグレーション中の緩く型付けされたセーブ（フィールド形が世代で変わるため）。 */
type RawSave = Record<string, unknown> & { version?: number };

/** version N のセーブを N+1 に変換する。返り値の version は N+1 にすること。 */
type Migration = (s: RawSave) => RawSave;

/**
 * MIGRATIONS[n] = version n → n+1 の変換。
 * 例（フィールド追加時）:
 *   [23]: (s) => ({ ...s, newField: defaultValue, version: 24 }),
 * 現状は履歴的に「不一致は破棄」で運用してきたため空。ここに足せば段階移行が効く。
 */
const MIGRATIONS: Record<number, Migration> = {};

/**
 * 生のセーブを現行スキーマへ移行して返す。移行できなければ null（呼び出し側は新規開始）。
 * - version === SAVE_VERSION: そのまま採用。
 * - version < SAVE_VERSION: 連続するステップが全て揃っていれば順次適用、欠けたら null。
 * - version > SAVE_VERSION（将来版/巻き戻し）: 後方移行はしないので null。
 */
export function migrateSave(raw: unknown): SaveState | null {
  if (!raw || typeof raw !== "object") return null;
  let s = raw as RawSave;
  let v = typeof s.version === "number" ? s.version : -1;
  if (v < 0) return null;

  while (v < SAVE_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) return null; // 経路が無い → 破棄
    s = step(s);
    v = typeof s.version === "number" ? s.version : v + 1;
  }

  return v === SAVE_VERSION ? (s as unknown as SaveState) : null;
}

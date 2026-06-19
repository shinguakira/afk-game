// オフライン進行の集計DTO（非永続。「おかえり」表示用に simulateOffline が返す）。
export interface OfflineSummary {
  ms: number;
  xp: Record<string, number>;
  items: Record<string, number>;
  gold: number;
}

// 小さな汎用ユーティリティ。

/** min..max の整数乱数（両端含む）。 */
export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Set に対するトグル（あれば削除、無ければ追加）。新しい Set を返す。 */
export function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

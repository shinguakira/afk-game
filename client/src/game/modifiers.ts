// Generic modifier system. Job classes (and later 資格/施設/転生) emit Modifiers;
// the engine resolves them into multipliers applied at computation sites.

export type EffectKey =
  // 生産/制作/遂行 の作業速度（大きいほど速い）
  | "speed.gather"
  | "speed.craft"
  | "speed.combat"
  // 獲得経験値
  | "xp.gather"
  | "xp.craft"
  | "xp.combat"
  // 戦闘ステ倍率
  | "power.maxHit"
  | "power.accuracy"
  | "power.defence"
  | "power.maxHp"
  // 経済
  | "gold"
  | "dropRate";

export interface Modifier {
  key: EffectKey;
  /** パーセント加算。+30 で +30%。同keyは合算してから乗算化。 */
  pct: number;
  note?: string;
}

export type Effects = Partial<Record<EffectKey, number>>;

/**
 * Sum percentages per key, then turn into a multiplier (1 + sum/100).
 * Floored at 0.1 so a stack of penalties can never zero/invert a value.
 */
export function resolveModifiers(mods: Modifier[]): Effects {
  const pct: Record<string, number> = {};
  for (const m of mods) pct[m.key] = (pct[m.key] ?? 0) + m.pct;
  const out: Effects = {};
  for (const k in pct) out[k as EffectKey] = Math.max(0.1, 1 + pct[k] / 100);
  return out;
}

/** Multiplier for a key (default 1 when no modifier touches it). */
export function mult(eff: Effects, key: EffectKey): number {
  return eff[key] ?? 1;
}

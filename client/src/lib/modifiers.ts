// Generic modifier system. Job classes (and later 資格/施設/転生) emit Modifiers;
// the engine resolves them into multipliers applied at computation sites.
// 型は types/effects.ts。ここは集計/合成ロジックと表示ラベル。
import type { EffectKey, Effects, Modifier } from "@/types/effects";

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

/** 表示用ラベル（職種/装備/起業ツリーの補正表示で共通利用）。 */
export const EFFECT_LABEL: Record<EffectKey, string> = {
  "speed.gather": "生産速度",
  "speed.craft": "制作速度",
  "speed.combat": "案件速度",
  "xp.gather": "生産XP",
  "xp.craft": "制作XP",
  "xp.combat": "遂行XP",
  "power.maxHit": "実装力",
  "power.accuracy": "精度",
  "power.defence": "堅牢性",
  "power.maxHp": "メンタル上限",
  gold: "給料",
  dropRate: "ドロップ率",
};

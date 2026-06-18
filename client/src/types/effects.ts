// 補正(modifier)系の型。集計ロジックは lib/modifiers.ts、合成は lib/effects.ts。
/** 効果キー。作業速度 / 獲得XP / 戦闘ステ倍率 / 経済 に作用する。 */
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

/** 集計済みの効果値（key→係数。未指定キーは既定1）。 */
export type Effects = Partial<Record<EffectKey, number>>;

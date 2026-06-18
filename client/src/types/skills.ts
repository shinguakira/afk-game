export type SkillKind = "gather" | "craft" | "combat";

/** サイドバーの大分類。
 *  language=言語(どう書く) / platform=領域・プラットフォーム(何を作る) /
 *  infra=インフラ・基盤(どこで動かす) / domain=業界ドメイン(誰のために) /
 *  craft=クラフト / combat=現場力。 */
export type SkillCategory = "language" | "platform" | "infra" | "domain" | "craft" | "combat";

export interface Skill {
  id: string;
  name: string;
  /** gather=生産系, craft=制作系, combat=現場力(戦闘ステ)。エンジンの速度/XP補正に使用。 */
  kind: SkillKind;
  icon: string;
  /** サイドバーの大分類。 */
  category: SkillCategory;
  /** 技術の種別（言語スキル内の表示用）。 */
  tech?: "language" | "framework";
  /** 公式サイト/ドキュメントURL（言語・インフラ等）。見出しにリンク表示。 */
  url?: string;
}

/** アクションの種別（言語スキル内の表示グループ）。 */
export type ActionCategory = "base" | "concept" | "library" | "framework" | "oss" | "cert";

/** A repeatable training action: gather a resource or craft an item. */
export interface GameAction {
  id: string;
  skill: string;
  name: string;
  /** 言語スキル内での表示分類。 */
  category?: ActionCategory;
  /** アクション固有アイコン（未指定なら category から決定）。 */
  icon?: string;
  /** Skill level required to perform this action. */
  level: number;
  /** Time per completion in ms. */
  time: number;
  /** XP granted to `skill` per completion. */
  xp: number;
  /** 公式サイト/ドキュメントURL（フレームワーク/ライブラリ/資格）。カードにリンク表示。 */
  url?: string;
  /** 副次的に経験値が入るスキル。完了ごとに `skill`(主)に加えてこちらにも入る。
   *  例: フレームワーク実装は言語(主)＋ドメイン(副)。概念は分離・獲得は同時。 */
  xpAlso?: { skill: string; xp: number };
  /** Items consumed per completion (craft actions). */
  inputs?: Partial<Record<string, number>>;
  /** Items produced per completion. */
  outputs: Partial<Record<string, number>>;
}

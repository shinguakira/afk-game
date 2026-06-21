import type { SaveState } from "@/types/save";
import { SKILLS } from "@/constants/skills";
import { levelForXp, langLevelCap } from "@/lib/xp";
import { currentRank } from "@/lib/rank";

// キャリア・ロードマップ＝メインクエストの背骨。常に「次の目標」を1つ提示する。
// 達成条件は耐久的なセーブ状態（Lv/円/装備/職種/役職/起業回数）から判定する。

export type MilestoneAxis = "tech" | "money" | "project" | "rank" | "meta";

export interface Milestone {
  id: string;
  title: string;
  hint: string; // 何をすれば達成かの説明
  axis: MilestoneAxis;
  check: (s: SaveState) => boolean;
  reward?: { gold?: number; items?: Record<string, number> };
}

export const AXIS_META: Record<MilestoneAxis, { icon: string; label: string }> = {
  tech: { icon: "tech", label: "技術" },
  money: { icon: "funding", label: "金" },
  project: { icon: "projects", label: "案件" },
  rank: { icon: "career", label: "出世" },
  meta: { icon: "prestige", label: "メタ" },
};

// ---- 判定ヘルパー ----
const langLevels = (s: SaveState): number[] =>
  SKILLS.filter((k) => k.tech === "language").map((k) => levelForXp(s.skills[k.id]?.xp ?? 0, langLevelCap(s.mainLang, s.interestLangs, k.id)));
const maxLangLevel = (s: SaveState): number => Math.max(0, ...langLevels(s));
const langsAtLeast = (s: SaveState, lv: number): number =>
  langLevels(s).filter((l) => l >= lv).length;

export const MILESTONES: Milestone[] = [
  {
    id: "first_commit",
    title: "初コミット",
    hint: "いずれかの言語を Lv2 まで上げる",
    axis: "tech",
    check: (s) => maxLangLevel(s) >= 2,
    reward: { gold: 50 },
  },
  {
    id: "first_framework",
    title: "フレームワーク解禁",
    hint: "いずれかの言語を Lv5（フレームワーク実装が解禁）",
    axis: "tech",
    check: (s) => maxLangLevel(s) >= 5,
    reward: { gold: 150 },
  },
  {
    id: "first_device",
    title: "デバイスを装備",
    hint: "ショップでキーボード/マウスを買って装備する",
    axis: "money",
    check: (s) => !!s.equipment.weapon,
    reward: { gold: 100 },
  },
  {
    id: "savings_1k",
    title: "貯金 ¥1,000",
    hint: "案件や売却で円を 1,000 貯める",
    axis: "money",
    check: (s) => s.gold >= 1000,
    reward: { gold: 200 },
  },
  {
    id: "first_class",
    title: "職種を選ぶ",
    hint: "ミドルに昇進し、キャリア画面で職種を選択する",
    axis: "rank",
    check: (s) => !!s.jobClass && s.jobClass !== "none",
    reward: { gold: 300 },
  },
  {
    id: "first_pc",
    title: "自作PCを組む",
    hint: "PC組み立てで作ったPCを装備する",
    axis: "tech",
    check: (s) => !!s.equipment.pc,
    reward: { gold: 400 },
  },
  {
    id: "polyglot_3",
    title: "3言語を Lv15",
    hint: "3つの言語を Lv15 以上にする",
    axis: "tech",
    check: (s) => langsAtLeast(s, 15) >= 3,
    reward: { gold: 800 },
  },
  {
    id: "senior",
    title: "シニアに昇進",
    hint: "総合熟練度を上げてシニアへ",
    axis: "rank",
    check: (s) => currentRank(s).index >= 3,
    reward: { gold: 1000 },
  },
  {
    id: "savings_100k",
    title: "貯金 ¥100,000",
    hint: "運用収入・案件で円を 10万 貯める",
    axis: "money",
    check: (s) => s.gold >= 100_000,
    reward: { gold: 5000 },
  },
  {
    id: "first_startup",
    title: "初めての起業",
    hint: "起業（プレステージ）を1回行う",
    axis: "meta",
    check: (s) => s.prestigeCount >= 1,
  },

  // ---- 終盤: 3大目標（遠い到達点）----
  {
    id: "goal_moon",
    title: "月を購入する",
    hint: "資産を極める（金軸の到達点）",
    axis: "money",
    check: (s) => s.gold >= 1_000_000_000,
  },
  {
    id: "goal_new_language",
    title: "新しい言語を開発",
    hint: "10言語を Lv50 以上に（技術軸の到達点）",
    axis: "tech",
    check: (s) => langsAtLeast(s, 50) >= 10,
  },
  // 「でかい会社を制覇」は会社/ダンジョン実装後に追加予定（案件軸の到達点）。
];

/** 最初の未達成マイルストーン（＝今の目標）。全達成なら null。 */
export function firstIncomplete(completed: string[], state: SaveState): Milestone | null {
  const done = new Set(completed);
  for (const m of MILESTONES) {
    if (!done.has(m.id) && !m.check(state)) return m;
  }
  // 全部 check 済みだが未マーク、のケースは無い想定。未達成が無ければ null。
  return MILESTONES.find((m) => !done.has(m.id)) ?? null;
}

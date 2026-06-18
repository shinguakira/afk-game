import type { GameAction } from "../types";

// 農業は2層:
//  - 作物 = 放置成長。畑(plot)に植えると経過時間で育ち、収穫すると作物アイテム＋farming XP。
//  - 手入れ = 能動。土を整える/水やり/肥料をまく は active アクション。farming XP が入り、
//    手入れ中(=activeがfarmingアクション)は全畑の成長が TEND_BOOST 倍に加速する。

export interface FarmCrop {
  id: string; // 収穫物アイテムid（itemsと一致）
  level: number; // 解禁farming Lv
  growMs: number; // 放置での成長に要する時間
  yield: number; // 1収穫の個数
  xp: number; // 収穫時のfarming XP
  seed?: string; // 植えるのに必要な種アイテムid（消費）。未指定＝種不要（パースニップのみ）
}

// 放置ゲームとして成長は長尺（最短30分〜6時間）。手入れ(active=farming)で ×2.5 加速、オフラインも進む。
export const FARM_CROPS: FarmCrop[] = [
  // パースニップだけは種が無くても植えられる（スターター作物・4時間で大量収穫）。
  { id: "parsnip", level: 1, growMs: 14_400_000, yield: 8, xp: 120 }, // 4時間
  { id: "tomato", level: 1, growMs: 1_800_000, yield: 3, xp: 25, seed: "seed_tomato" }, // 30分(最短)
  { id: "rice", level: 2, growMs: 2_700_000, yield: 4, xp: 42, seed: "seed_rice" }, // 45分
  { id: "carrot", level: 3, growMs: 3_600_000, yield: 5, xp: 60, seed: "seed_carrot" }, // 1時間
  { id: "edamame", level: 5, growMs: 5_400_000, yield: 6, xp: 92, seed: "seed_edamame" }, // 1.5時間
  { id: "dough", level: 6, growMs: 7_200_000, yield: 7, xp: 130, seed: "seed_wheat" }, // 2時間 小麦→製粉
  { id: "shiitake", level: 8, growMs: 10_800_000, yield: 9, xp: 200, seed: "seed_shiitake" }, // 3時間
  { id: "strawberry", level: 10, growMs: 14_400_000, yield: 11, xp: 300, seed: "seed_strawberry" }, // 4時間
  { id: "apple", level: 13, growMs: 21_600_000, yield: 15, xp: 460, seed: "seed_apple" }, // 6時間

  // ハーブ・ドリンク素材系（料理でジュース/茶/エナジードリンクの材料になる）
  { id: "mint", level: 2, growMs: 2_400_000, yield: 4, xp: 38, seed: "seed_mint" }, // 40分
  { id: "ginger", level: 4, growMs: 3_600_000, yield: 3, xp: 56, seed: "seed_ginger" }, // 1時間
  { id: "lemon", level: 5, growMs: 5_400_000, yield: 4, xp: 88, seed: "seed_lemon" }, // 1.5時間
  { id: "grape", level: 7, growMs: 7_200_000, yield: 5, xp: 125, seed: "seed_grape" }, // 2時間
  { id: "coffee_bean", level: 9, growMs: 10_800_000, yield: 4, xp: 190, seed: "seed_coffee" }, // 3時間
  { id: "ginseng", level: 12, growMs: 18_000_000, yield: 3, xp: 380, seed: "seed_ginseng" }, // 5時間
];

export const FARM_CROP_MAP: Record<string, FarmCrop> = Object.fromEntries(
  FARM_CROPS.map((c) => [c.id, c]),
);

export const PLOT_COUNT = 4;
export const TEND_BOOST = 2.5;

/** 手入れ＝能動アクション（farming XP＋手入れ中は成長加速）。 */
export const FARMING_TEND: GameAction[] = [
  {
    id: "farm_till",
    skill: "farming",
    name: "土を整える",
    icon: "till",
    level: 1,
    time: 2800,
    xp: 12,
    outputs: {},
  },
  {
    id: "farm_water",
    skill: "farming",
    name: "水やりをする",
    icon: "water",
    level: 1,
    time: 2600,
    xp: 10,
    outputs: {},
  },
  {
    id: "farm_fertilize",
    skill: "farming",
    name: "肥料をまく",
    icon: "fertilizer",
    level: 4,
    time: 3200,
    xp: 22,
    outputs: {},
  },
];

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

export const FARM_CROPS: FarmCrop[] = [
  // パースニップだけは種が無くても植えられる（スターター作物）。
  { id: "parsnip", level: 1, growMs: 40_000, yield: 3, xp: 18 },
  { id: "tomato", level: 1, growMs: 45_000, yield: 3, xp: 20, seed: "seed_tomato" },
  { id: "rice", level: 2, growMs: 60_000, yield: 4, xp: 26, seed: "seed_rice" },
  { id: "carrot", level: 3, growMs: 55_000, yield: 3, xp: 30, seed: "seed_carrot" },
  { id: "edamame", level: 5, growMs: 70_000, yield: 3, xp: 40, seed: "seed_edamame" },
  { id: "dough", level: 6, growMs: 80_000, yield: 3, xp: 46, seed: "seed_wheat" }, // 小麦→製粉
  { id: "shiitake", level: 8, growMs: 95_000, yield: 3, xp: 58, seed: "seed_shiitake" },
  { id: "strawberry", level: 10, growMs: 115_000, yield: 4, xp: 72, seed: "seed_strawberry" },
  { id: "apple", level: 13, growMs: 145_000, yield: 5, xp: 96, seed: "seed_apple" },
];

export const FARM_CROP_MAP: Record<string, FarmCrop> = Object.fromEntries(
  FARM_CROPS.map((c) => [c.id, c]),
);

export const PLOT_COUNT = 4;
export const TEND_BOOST = 2.5;

/** 手入れ＝能動アクション（farming XP＋手入れ中は成長加速）。 */
export const FARMING_TEND: GameAction[] = [
  { id: "farm_till", skill: "farming", name: "土を整える", icon: "till", level: 1, time: 2800, xp: 12, outputs: {} },
  { id: "farm_water", skill: "farming", name: "水やりをする", icon: "water", level: 1, time: 2600, xp: 10, outputs: {} },
  { id: "farm_fertilize", skill: "farming", name: "肥料をまく", icon: "fertilizer", level: 4, time: 3200, xp: 22, outputs: {} },
];

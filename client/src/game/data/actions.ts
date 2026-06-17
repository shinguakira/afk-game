import type { GameAction } from "../types";
import { buildActions } from "./techtree";
import { SECTOR_ACTIONS } from "./sectors";
import { FARMING_TEND } from "./farming";

// 料理: 食材を消費して飲食物(回復アイテム)を作る。
const COOKING: GameAction[] = [
  { id: "cook_onigiri", skill: "cooking", name: "おにぎりを握る", level: 1, time: 2600, xp: 14, inputs: { rice: 2 }, outputs: { onigiri: 1 } },
  { id: "cook_bento", skill: "cooking", name: "弁当を作る", level: 4, time: 3000, xp: 22, inputs: { rice: 1, meat: 1, veg: 1 }, outputs: { bento: 1 } },
  { id: "cook_ramen", skill: "cooking", name: "ラーメンを作る", level: 6, time: 3200, xp: 28, inputs: { noodles: 2, meat: 1 }, outputs: { ramen: 1 } },
  { id: "cook_gyudon", skill: "cooking", name: "牛丼を作る", level: 8, time: 3200, xp: 30, inputs: { rice: 1, meat: 2 }, outputs: { gyudon: 1 } },
  { id: "cook_pizza", skill: "cooking", name: "ピザを焼く", level: 12, time: 3600, xp: 38, inputs: { dough: 1, veg: 1, meat: 1 }, outputs: { pizza: 1 } },
  { id: "cook_sushi", skill: "cooking", name: "寿司を握る", level: 16, time: 3800, xp: 46, inputs: { rice: 1, fish_ing: 2 }, outputs: { sushi: 1 } },
  { id: "cook_steak", skill: "cooking", name: "ステーキを焼く", level: 20, time: 4000, xp: 54, inputs: { meat: 3 }, outputs: { steak: 1 } },
];

// PC組み立て: ショップで買ったパーツを組んで PC(装備) を作る。
const PCBUILD: GameAction[] = [
  { id: "assemble_pc_low", skill: "pcbuild", name: "エントリーPCを組む", level: 1, time: 4000, xp: 40, inputs: { cpu_celeron: 1, gpu_igpu: 1, ram_8: 1, ssd_512: 1 }, outputs: { pc_low: 1 } },
  { id: "assemble_pc_mid", skill: "pcbuild", name: "ミドルレンジPCを組む", level: 8, time: 4500, xp: 85, inputs: { cpu_i5: 1, gpu_rtx4060: 1, ram_32: 1, ssd_512: 1 }, outputs: { pc_mid: 1 } },
  { id: "assemble_pc_high", skill: "pcbuild", name: "ハイエンドPCを組む", level: 16, time: 5000, xp: 150, inputs: { cpu_i9: 1, gpu_rtx4090: 1, ram_32: 1, ssd_2tb: 1 }, outputs: { pc_high: 1 } },
];

// 農業の作物は「畑で放置成長→収穫」（store側のplots）。ここに来るのは能動の手入れアクションのみ。

// 全アクション = 言語ツリー(techtree) + インフラ/領域/ドメイン/電子工作(sectors) + 料理 + PC組み立て + 農業の手入れ。
export const ACTIONS: GameAction[] = [
  ...buildActions(),
  ...SECTOR_ACTIONS,
  ...COOKING,
  ...PCBUILD,
  ...FARMING_TEND,
];

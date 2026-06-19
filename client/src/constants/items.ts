import type { Item } from "@/types/items";

export const ITEMS: Item[] = [
  // ===== 資源 =====
  // commit = 仕事の成果単位。生産アクションの産出物であり、売却（金源）にも上位アクションの素材にもなる。
  { id: "commit", name: "コミット", type: "resource", icon: "commit", sellPrice: 2 },

  // ===== 装備: 武器 (キーボード / マウス) =====
  {
    id: "membrane_kb",
    name: "メンブレンキーボード",
    type: "weapon",
    icon: "keyboard",
    sellPrice: 20,
    equip: { slot: "weapon", weapon: { attackBonus: 3, strengthBonus: 3, speed: 2800 } },
  },
  {
    id: "mechanical_kb",
    name: "メカニカルキーボード",
    type: "weapon",
    icon: "keyboard",
    sellPrice: 60,
    equip: { slot: "weapon", weapon: { attackBonus: 6, strengthBonus: 6, speed: 2500 } },
  },
  {
    id: "gaming_mouse",
    name: "ゲーミングマウス",
    type: "weapon",
    icon: "mouse",
    sellPrice: 50,
    equip: { slot: "weapon", weapon: { attackBonus: 9, strengthBonus: 4, speed: 2400 } },
  },
  {
    id: "hhkb",
    name: "HHKB",
    type: "weapon",
    icon: "keyboard",
    sellPrice: 130,
    equip: { slot: "weapon", weapon: { attackBonus: 11, strengthBonus: 9, speed: 2300 } },
  },
  {
    id: "realforce",
    name: "REALFORCE",
    type: "weapon",
    icon: "keyboard",
    sellPrice: 240,
    equip: { slot: "weapon", weapon: { attackBonus: 15, strengthBonus: 14, speed: 2200 } },
  },

  // ===== 装備: 服 (body) =====
  {
    id: "tshirt",
    name: "Tシャツ",
    type: "misc",
    icon: "shirt",
    sellPrice: 10,
    equip: { slot: "body", modifiers: [{ key: "power.maxHp", pct: 5 }] },
  },
  {
    id: "hoodie",
    name: "パーカー",
    type: "misc",
    icon: "shirt",
    sellPrice: 40,
    equip: {
      slot: "body",
      modifiers: [
        { key: "power.maxHp", pct: 10 },
        { key: "speed.gather", pct: 3 },
      ],
    },
  },
  {
    id: "suit",
    name: "スーツ",
    type: "misc",
    icon: "shirt",
    sellPrice: 120,
    equip: {
      slot: "body",
      modifiers: [
        { key: "gold", pct: 12 },
        { key: "power.defence", pct: 10 },
      ],
    },
  },
  {
    id: "workwear",
    name: "作業着",
    type: "misc",
    icon: "shirt",
    sellPrice: 60,
    equip: { slot: "body", modifiers: [{ key: "speed.craft", pct: 12 }] },
  },

  // ===== 装備: かばん (bag) =====
  {
    id: "backpack",
    name: "リュックサック",
    type: "misc",
    icon: "bag",
    sellPrice: 30,
    equip: { slot: "bag", modifiers: [{ key: "dropRate", pct: 10 }] },
  },
  {
    id: "tote",
    name: "トートバッグ",
    type: "misc",
    icon: "tote",
    sellPrice: 25,
    equip: { slot: "bag", modifiers: [{ key: "gold", pct: 8 }] },
  },
  {
    id: "bizbag",
    name: "ビジネスバッグ",
    type: "misc",
    icon: "bizbag",
    sellPrice: 90,
    equip: {
      slot: "bag",
      modifiers: [
        { key: "power.maxHp", pct: 10 },
        { key: "gold", pct: 5 },
      ],
    },
  },

  // ===== 装備: 髪型 (hair) =====
  {
    id: "bedhair",
    name: "寝癖ヘア",
    type: "misc",
    icon: "hair",
    sellPrice: 1,
    equip: { slot: "hair", modifiers: [{ key: "speed.gather", pct: 2 }] },
  },
  {
    id: "neat_hair",
    name: "七三分け",
    type: "misc",
    icon: "hair",
    sellPrice: 30,
    equip: { slot: "hair", modifiers: [{ key: "gold", pct: 6 }] },
  },
  {
    id: "afro",
    name: "アフロ",
    type: "misc",
    icon: "hair",
    sellPrice: 50,
    equip: { slot: "hair", modifiers: [{ key: "dropRate", pct: 10 }] },
  },
  {
    id: "ponytail",
    name: "ポニーテール",
    type: "misc",
    icon: "hair",
    sellPrice: 40,
    equip: { slot: "hair", modifiers: [{ key: "speed.gather", pct: 6 }] },
  },

  // ===== 装備: アイコン (avatar) =====
  {
    id: "av_default",
    name: "デフォルトアイコン",
    type: "misc",
    icon: "avatar",
    sellPrice: 1,
    equip: { slot: "avatar", modifiers: [] },
  },
  {
    id: "av_cat",
    name: "猫アイコン",
    type: "misc",
    icon: "avatar",
    sellPrice: 25,
    equip: { slot: "avatar", modifiers: [{ key: "dropRate", pct: 6 }] },
  },
  {
    id: "av_pixel",
    name: "ドット絵アイコン",
    type: "misc",
    icon: "avatar",
    sellPrice: 35,
    equip: { slot: "avatar", modifiers: [{ key: "xp.gather", pct: 6 }] },
  },
  {
    id: "av_anime",
    name: "アニメアイコン",
    type: "misc",
    icon: "avatar",
    sellPrice: 60,
    equip: {
      slot: "avatar",
      modifiers: [
        { key: "dropRate", pct: 8 },
        { key: "gold", pct: 4 },
      ],
    },
  },

  // ===== 組み立てPC (pc) — pcbuild で作る =====
  {
    id: "pc_low",
    name: "エントリーPC",
    type: "misc",
    icon: "pc",
    sellPrice: 80,
    equip: {
      slot: "pc",
      modifiers: [
        { key: "speed.gather", pct: 10 },
        { key: "xp.gather", pct: 5 },
      ],
    },
  },
  {
    id: "pc_mid",
    name: "ミドルレンジPC",
    type: "misc",
    icon: "pc",
    sellPrice: 260,
    equip: {
      slot: "pc",
      modifiers: [
        { key: "speed.gather", pct: 20 },
        { key: "speed.craft", pct: 15 },
        { key: "xp.gather", pct: 10 },
      ],
    },
  },
  {
    id: "pc_high",
    name: "ハイエンドPC",
    type: "misc",
    icon: "pc",
    sellPrice: 700,
    equip: {
      slot: "pc",
      modifiers: [
        { key: "speed.gather", pct: 35 },
        { key: "speed.craft", pct: 30 },
        { key: "xp.gather", pct: 18 },
        { key: "power.maxHit", pct: 10 },
      ],
    },
  },

  // ===== PCパーツ (ショップで購入 → pcbuild で組む) =====
  { id: "cpu_celeron", name: "Celeron", type: "misc", icon: "cpu", sellPrice: 20 },
  { id: "cpu_i5", name: "Core i5", type: "misc", icon: "cpu", sellPrice: 90 },
  { id: "cpu_i9", name: "Core i9", type: "misc", icon: "cpu", sellPrice: 260 },
  { id: "gpu_igpu", name: "内蔵GPU", type: "misc", icon: "gpu", sellPrice: 15 },
  { id: "gpu_rtx4060", name: "RTX 4060", type: "misc", icon: "gpu", sellPrice: 120 },
  { id: "gpu_rtx4090", name: "RTX 4090", type: "misc", icon: "gpu", sellPrice: 400 },
  { id: "ram_8", name: "8GB RAM", type: "misc", icon: "ram", sellPrice: 12 },
  { id: "ram_32", name: "32GB RAM", type: "misc", icon: "ram", sellPrice: 60 },
  { id: "ssd_512", name: "512GB SSD", type: "misc", icon: "ssd", sellPrice: 18 },
  { id: "ssd_2tb", name: "2TB SSD", type: "misc", icon: "ssd", sellPrice: 70 },

  // ===== 電子部品 / 電子工作品 =====
  { id: "components", name: "電子部品", type: "misc", icon: "components", sellPrice: 4 },
  { id: "circuit", name: "自作回路", type: "product", icon: "board", sellPrice: 22 },
  {
    id: "microcontroller",
    name: "マイコンボード",
    type: "product",
    icon: "embedded",
    sellPrice: 70,
  },
  {
    id: "rpi_device",
    name: "Raspberry Pi 工作",
    type: "product",
    icon: "raspberrypi",
    sellPrice: 150,
  },
  { id: "robot", name: "自作ロボット", type: "product", icon: "robot", sellPrice: 320 },

  // ===== 食材 (米/野菜/生地は農業で自給可。肉/魚/麺はショップ) =====
  { id: "rice", name: "米", type: "misc", icon: "rice", sellPrice: 2 },
  { id: "noodles", name: "麺", type: "misc", icon: "noodles", sellPrice: 2 },
  { id: "meat", name: "肉", type: "misc", icon: "meat", sellPrice: 4 },
  { id: "fish_ing", name: "魚", type: "misc", icon: "fish_food", sellPrice: 4 },
  { id: "veg", name: "野菜", type: "misc", icon: "veg", sellPrice: 2 },
  { id: "dough", name: "生地", type: "misc", icon: "dough", sellPrice: 3 },
  // 農業の収穫物（具体的な作物）。食べるとメンタル回復（生食なので控えめ）。料理素材にもなる。
  { id: "parsnip", name: "パースニップ", type: "food", icon: "parsnip", sellPrice: 3, heals: 5 },
  { id: "tomato", name: "ミニトマト", type: "food", icon: "tomato", sellPrice: 4, heals: 6 },
  { id: "carrot", name: "にんじん", type: "food", icon: "carrot", sellPrice: 5, heals: 9 },
  { id: "edamame", name: "枝豆", type: "food", icon: "edamame", sellPrice: 7, heals: 12 },
  { id: "shiitake", name: "しいたけ", type: "food", icon: "shiitake", sellPrice: 9, heals: 16 },
  { id: "strawberry", name: "いちご", type: "food", icon: "strawberry", sellPrice: 12, heals: 20 },
  { id: "apple", name: "りんご", type: "food", icon: "apple", sellPrice: 15, heals: 26 },

  // ===== ハーブ・ドリンク素材（農業で栽培。ジュース/茶/エナジードリンクの材料） =====
  { id: "mint", name: "ミント", type: "misc", icon: "mint", sellPrice: 4 },
  { id: "ginger", name: "しょうが", type: "misc", icon: "ginger", sellPrice: 5 },
  { id: "lemon", name: "レモン", type: "misc", icon: "lemon", sellPrice: 6 },
  { id: "grape", name: "ぶどう", type: "food", icon: "grape", sellPrice: 10, heals: 10 },
  { id: "coffee_bean", name: "コーヒー豆", type: "misc", icon: "coffee_bean", sellPrice: 8 },
  { id: "ginseng", name: "高麗人参", type: "misc", icon: "ginseng", sellPrice: 14 },

  // ===== 種（ショップで購入 → 農業で植える。パースニップは種不要） =====
  { id: "seed_tomato", name: "ミニトマトの種", type: "misc", icon: "seed", sellPrice: 2 },
  { id: "seed_rice", name: "稲の種もみ", type: "misc", icon: "seed", sellPrice: 2 },
  { id: "seed_carrot", name: "にんじんの種", type: "misc", icon: "seed", sellPrice: 2 },
  { id: "seed_edamame", name: "枝豆の種", type: "misc", icon: "seed", sellPrice: 3 },
  { id: "seed_wheat", name: "小麦の種", type: "misc", icon: "seed", sellPrice: 3 },
  { id: "seed_shiitake", name: "しいたけの菌床", type: "misc", icon: "seed", sellPrice: 4 },
  { id: "seed_strawberry", name: "いちごの苗", type: "misc", icon: "seed", sellPrice: 5 },
  { id: "seed_apple", name: "りんごの苗木", type: "misc", icon: "seed", sellPrice: 6 },
  { id: "seed_mint", name: "ミントの苗", type: "misc", icon: "seed", sellPrice: 2 },
  { id: "seed_ginger", name: "しょうがの種", type: "misc", icon: "seed", sellPrice: 3 },
  { id: "seed_lemon", name: "レモンの苗木", type: "misc", icon: "seed", sellPrice: 4 },
  { id: "seed_grape", name: "ぶどうの苗", type: "misc", icon: "seed", sellPrice: 5 },
  { id: "seed_coffee", name: "コーヒーの苗木", type: "misc", icon: "seed", sellPrice: 6 },
  { id: "seed_ginseng", name: "高麗人参の種", type: "misc", icon: "seed", sellPrice: 8 },

  // ===== 飲食物 (food / 回復) =====
  { id: "water", name: "水", type: "food", icon: "water", sellPrice: 1, heals: 3 },
  { id: "coffee", name: "コーヒー", type: "food", icon: "coffee", sellPrice: 3, heals: 5 },
  { id: "cola", name: "コーラ", type: "food", icon: "cola", sellPrice: 3, heals: 7 },
  { id: "onigiri", name: "おにぎり", type: "food", icon: "onigiri", sellPrice: 4, heals: 9 },
  {
    id: "energy_drink",
    name: "エナジードリンク",
    type: "food",
    icon: "energy",
    sellPrice: 8,
    heals: 13,
  },
  { id: "cupramen", name: "カップ麺", type: "food", icon: "cupramen", sellPrice: 5, heals: 11 },
  { id: "bento", name: "弁当", type: "food", icon: "bento", sellPrice: 10, heals: 16 },
  { id: "ramen", name: "ラーメン", type: "food", icon: "ramen", sellPrice: 14, heals: 20 },
  { id: "gyudon", name: "牛丼", type: "food", icon: "gyudon", sellPrice: 15, heals: 22 },
  { id: "pizza", name: "ピザ", type: "food", icon: "pizza", sellPrice: 18, heals: 26 },
  { id: "sushi", name: "寿司", type: "food", icon: "sushi", sellPrice: 24, heals: 30 },
  { id: "steak", name: "ステーキ", type: "food", icon: "steak", sellPrice: 30, heals: 38 },
  { id: "paid_leave", name: "有給", type: "food", icon: "leave", sellPrice: 50, heals: 60 },
  // 自家製ドリンク（料理で作物素材から作る）
  { id: "mint_tea", name: "ミントティー", type: "food", icon: "mint_tea", sellPrice: 8, heals: 14 },
  { id: "lemonade", name: "レモネード", type: "food", icon: "lemonade", sellPrice: 12, heals: 18 },
  {
    id: "grape_juice",
    name: "ぶどうジュース",
    type: "food",
    icon: "grape_juice",
    sellPrice: 16,
    heals: 24,
  },
  {
    id: "homemade_energy",
    name: "自家製エナジードリンク",
    type: "food",
    icon: "energy_home",
    sellPrice: 28,
    heals: 42,
  },
];
// 注: OSS活動/資格/評価/負債のような「抽象的な成果」はアイテム化しない（在庫に積む名詞はノイズ）。
// 知的活動が生むのは commit のみ。アイテムを生むのは物理制作(料理/PC組立/電子工作)だけ。

import type { Item } from "@/types/items";

export const ITEMS: Item[] = [
  // ===== 資源 =====
  { id: "commit", name: "コミット", type: "resource", icon: "commit", sellPrice: 2 },

  // ===== 装備: 武器 (キーボード / マウス) =====
  // 1 gold = 1円。sellPrice = 実勢価格 ÷ 2（ショップは×2マークアップ）
  {
    id: "membrane_kb",
    name: "メンブレンキーボード",
    type: "weapon",
    icon: "keyboard",
    sellPrice: 1_250,   // ショップ ¥2,500
    equip: { slot: "weapon", weapon: { attackBonus: 3, strengthBonus: 3, speed: 2800 } },
  },
  {
    id: "mechanical_kb",
    name: "メカニカルキーボード",
    type: "weapon",
    icon: "keyboard",
    sellPrice: 7_500,   // ショップ ¥15,000
    equip: { slot: "weapon", weapon: { attackBonus: 6, strengthBonus: 6, speed: 2500 } },
  },
  {
    id: "gaming_mouse",
    name: "ゲーミングマウス",
    type: "weapon",
    icon: "mouse",
    sellPrice: 6_000,   // ショップ ¥12,000
    equip: { slot: "weapon", weapon: { attackBonus: 9, strengthBonus: 4, speed: 2400 } },
  },
  {
    id: "hhkb",
    name: "HHKB",
    type: "weapon",
    icon: "keyboard",
    sellPrice: 18_500,  // ショップ ¥37,000
    equip: { slot: "weapon", weapon: { attackBonus: 11, strengthBonus: 9, speed: 2300 } },
  },
  {
    id: "realforce",
    name: "REALFORCE",
    type: "weapon",
    icon: "keyboard",
    sellPrice: 17_500,  // ショップ ¥35,000
    equip: { slot: "weapon", weapon: { attackBonus: 15, strengthBonus: 14, speed: 2200 } },
  },

  // ===== 装備: 服 (body) =====
  {
    id: "tshirt",
    name: "Tシャツ",
    type: "misc",
    icon: "shirt",
    sellPrice: 1_000,   // ショップ ¥2,000
    equip: { slot: "body", modifiers: [{ key: "power.maxHp", pct: 5 }] },
  },
  {
    id: "hoodie",
    name: "パーカー",
    type: "misc",
    icon: "shirt",
    sellPrice: 4_000,   // ショップ ¥8,000
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
    sellPrice: 30_000,  // ショップ ¥60,000
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
    sellPrice: 5_000,   // ショップ ¥10,000
    equip: { slot: "body", modifiers: [{ key: "speed.craft", pct: 12 }] },
  },

  // ===== 装備: かばん (bag) =====
  {
    id: "backpack",
    name: "リュックサック",
    type: "misc",
    icon: "bag",
    sellPrice: 3_000,   // ショップ ¥6,000
    equip: { slot: "bag", modifiers: [{ key: "dropRate", pct: 10 }] },
  },
  {
    id: "tote",
    name: "トートバッグ",
    type: "misc",
    icon: "tote",
    sellPrice: 1_750,   // ショップ ¥3,500
    equip: { slot: "bag", modifiers: [{ key: "gold", pct: 8 }] },
  },
  {
    id: "bizbag",
    name: "ビジネスバッグ",
    type: "misc",
    icon: "bizbag",
    sellPrice: 10_000,  // ショップ ¥20,000
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
    sellPrice: 1_500,   // 美容院 ¥3,000
    equip: { slot: "hair", modifiers: [{ key: "gold", pct: 6 }] },
  },
  {
    id: "afro",
    name: "アフロ",
    type: "misc",
    icon: "hair",
    sellPrice: 2_500,   // 特殊スタイリング ¥5,000
    equip: { slot: "hair", modifiers: [{ key: "dropRate", pct: 10 }] },
  },
  {
    id: "ponytail",
    name: "ポニーテール",
    type: "misc",
    icon: "hair",
    sellPrice: 2_000,   // サロン ¥4,000
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
    sellPrice: 750,     // ¥1,500
    equip: { slot: "avatar", modifiers: [{ key: "dropRate", pct: 6 }] },
  },
  {
    id: "av_pixel",
    name: "ドット絵アイコン",
    type: "misc",
    icon: "avatar",
    sellPrice: 2_500,   // ドット絵コミッション ¥5,000
    equip: { slot: "avatar", modifiers: [{ key: "xp.gather", pct: 6 }] },
  },
  {
    id: "av_anime",
    name: "アニメアイコン",
    type: "misc",
    icon: "avatar",
    sellPrice: 7_500,   // アニメ絵コミッション ¥15,000
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
    sellPrice: 25_000,  // ショップ ¥50,000
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
    sellPrice: 75_000,  // ショップ ¥150,000
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
    sellPrice: 250_000, // ショップ ¥500,000
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
  // Amazon Japan 2024-25年相場。sellPrice = 実勢価格 ÷ 2。
  { id: "cpu_celeron", name: "Celeron",    type: "misc", icon: "cpu", sellPrice: 3_000   }, // ¥6,000
  { id: "cpu_i5",      name: "Core i5",   type: "misc", icon: "cpu", sellPrice: 17_500  }, // ¥35,000
  { id: "cpu_i9",      name: "Core i9",   type: "misc", icon: "cpu", sellPrice: 50_000  }, // ¥100,000
  { id: "gpu_igpu",    name: "内蔵GPU",   type: "misc", icon: "gpu", sellPrice: 500     }, // ¥1,000
  { id: "gpu_rtx4060", name: "RTX 4060",  type: "misc", icon: "gpu", sellPrice: 30_000  }, // ¥60,000
  { id: "gpu_rtx4090", name: "RTX 4090",  type: "misc", icon: "gpu", sellPrice: 125_000 }, // ¥250,000
  { id: "ram_8",       name: "8GB RAM",   type: "misc", icon: "ram", sellPrice: 2_500   }, // ¥5,000
  { id: "ram_32",      name: "32GB RAM",  type: "misc", icon: "ram", sellPrice: 9_000   }, // ¥18,000
  { id: "ssd_512",     name: "512GB SSD", type: "misc", icon: "ssd", sellPrice: 3_000   }, // ¥6,000
  { id: "ssd_2tb",     name: "2TB SSD",   type: "misc", icon: "ssd", sellPrice: 10_000  }, // ¥20,000

  // ===== 電子部品 / 電子工作品 =====
  { id: "components",      name: "電子部品",          type: "misc",    icon: "components", sellPrice: 1_000  }, // ¥2,000
  { id: "circuit",         name: "自作回路",           type: "product", icon: "board",      sellPrice: 1_500  }, // ¥3,000
  { id: "microcontroller", name: "マイコンボード",     type: "product", icon: "embedded",   sellPrice: 5_000  }, // ¥10,000
  { id: "rpi_device",      name: "Raspberry Pi 工作", type: "product", icon: "raspberrypi", sellPrice: 15_000 }, // ¥30,000
  { id: "robot",           name: "自作ロボット",       type: "product", icon: "robot",      sellPrice: 50_000 }, // ¥100,000

  // ===== 食材 =====
  { id: "rice",     name: "米",   type: "misc", icon: "rice",      sellPrice: 150 }, // ¥300
  { id: "noodles",  name: "麺",   type: "misc", icon: "noodles",   sellPrice: 125 }, // ¥250
  { id: "meat",     name: "肉",   type: "misc", icon: "meat",      sellPrice: 250 }, // ¥500
  { id: "fish_ing", name: "魚",   type: "misc", icon: "fish_food", sellPrice: 200 }, // ¥400
  { id: "veg",      name: "野菜", type: "misc", icon: "veg",       sellPrice: 75  }, // ¥150
  { id: "dough",    name: "生地", type: "misc", icon: "dough",     sellPrice: 150 }, // ¥300
  // 農業の収穫物
  { id: "parsnip",    name: "パースニップ", type: "food", icon: "parsnip",    sellPrice: 50,  heals: 5  }, // ¥100
  { id: "tomato",     name: "ミニトマト",   type: "food", icon: "tomato",     sellPrice: 80,  heals: 6  }, // ¥160
  { id: "carrot",     name: "にんじん",     type: "food", icon: "carrot",     sellPrice: 100, heals: 9  }, // ¥200
  { id: "edamame",    name: "枝豆",         type: "food", icon: "edamame",    sellPrice: 150, heals: 12 }, // ¥300
  { id: "shiitake",   name: "しいたけ",     type: "food", icon: "shiitake",   sellPrice: 200, heals: 16 }, // ¥400
  { id: "strawberry", name: "いちご",       type: "food", icon: "strawberry", sellPrice: 300, heals: 20 }, // ¥600
  { id: "apple",      name: "りんご",       type: "food", icon: "apple",      sellPrice: 350, heals: 26 }, // ¥700

  // ===== ハーブ・ドリンク素材 =====
  { id: "mint",        name: "ミント",     type: "misc", icon: "mint",        sellPrice: 100 }, // ¥200
  { id: "ginger",      name: "しょうが",   type: "misc", icon: "ginger",      sellPrice: 150 }, // ¥300
  { id: "lemon",       name: "レモン",     type: "misc", icon: "lemon",       sellPrice: 200 }, // ¥400
  { id: "grape",       name: "ぶどう",     type: "food", icon: "grape",       sellPrice: 200, heals: 10 }, // ¥400
  { id: "coffee_bean", name: "コーヒー豆", type: "misc", icon: "coffee_bean", sellPrice: 300 }, // ¥600
  { id: "ginseng",     name: "高麗人参",   type: "misc", icon: "ginseng",     sellPrice: 500 }, // ¥1,000

  // ===== 種（ショップで購入 → 農業で植える） =====
  { id: "seed_tomato",     name: "ミニトマトの種",   type: "misc", icon: "seed", sellPrice: 100   }, // ¥200
  { id: "seed_rice",       name: "稲の種もみ",       type: "misc", icon: "seed", sellPrice: 100   }, // ¥200
  { id: "seed_carrot",     name: "にんじんの種",     type: "misc", icon: "seed", sellPrice: 100   }, // ¥200
  { id: "seed_edamame",    name: "枝豆の種",         type: "misc", icon: "seed", sellPrice: 125   }, // ¥250
  { id: "seed_wheat",      name: "小麦の種",         type: "misc", icon: "seed", sellPrice: 150   }, // ¥300
  { id: "seed_shiitake",   name: "しいたけの菌床",   type: "misc", icon: "seed", sellPrice: 1_250 }, // ¥2,500
  { id: "seed_strawberry", name: "いちごの苗",       type: "misc", icon: "seed", sellPrice: 250   }, // ¥500
  { id: "seed_apple",      name: "りんごの苗木",     type: "misc", icon: "seed", sellPrice: 1_000 }, // ¥2,000
  { id: "seed_mint",       name: "ミントの苗",       type: "misc", icon: "seed", sellPrice: 100   }, // ¥200
  { id: "seed_ginger",     name: "しょうがの種",     type: "misc", icon: "seed", sellPrice: 150   }, // ¥300
  { id: "seed_lemon",      name: "レモンの苗木",     type: "misc", icon: "seed", sellPrice: 1_000 }, // ¥2,000
  { id: "seed_grape",      name: "ぶどうの苗",       type: "misc", icon: "seed", sellPrice: 1_000 }, // ¥2,000
  { id: "seed_coffee",     name: "コーヒーの苗木",   type: "misc", icon: "seed", sellPrice: 1_750 }, // ¥3,500
  { id: "seed_ginseng",    name: "高麗人参の種",     type: "misc", icon: "seed", sellPrice: 400   }, // ¥800

  // ===== 飲食物 (food / 回復) =====
  { id: "water",        name: "水",           type: "food", icon: "water",   sellPrice: 55,    heals: 3  }, // ¥110
  { id: "coffee",       name: "コーヒー",     type: "food", icon: "coffee",  sellPrice: 75,    heals: 5  }, // ¥150
  { id: "cola",         name: "コーラ",       type: "food", icon: "cola",    sellPrice: 80,    heals: 7  }, // ¥160
  { id: "onigiri",      name: "おにぎり",     type: "food", icon: "onigiri", sellPrice: 70,    heals: 9  }, // ¥140
  {
    id: "energy_drink",
    name: "エナジードリンク",
    type: "food",
    icon: "energy",
    sellPrice: 140,
    heals: 13,
  }, // ¥280
  { id: "cupramen",   name: "カップ麺", type: "food", icon: "cupramen", sellPrice: 110,   heals: 11 }, // ¥220
  { id: "bento",      name: "弁当",     type: "food", icon: "bento",    sellPrice: 300,   heals: 16 }, // ¥600
  { id: "ramen",      name: "ラーメン", type: "food", icon: "ramen",    sellPrice: 450,   heals: 20 }, // ¥900
  { id: "gyudon",     name: "牛丼",     type: "food", icon: "gyudon",   sellPrice: 350,   heals: 22 }, // ¥700
  { id: "pizza",      name: "ピザ",     type: "food", icon: "pizza",    sellPrice: 750,   heals: 26 }, // ¥1,500
  { id: "sushi",      name: "寿司",     type: "food", icon: "sushi",    sellPrice: 1_000, heals: 30 }, // ¥2,000
  { id: "steak",      name: "ステーキ", type: "food", icon: "steak",    sellPrice: 1_500, heals: 38 }, // ¥3,000
  { id: "paid_leave", name: "有給",     type: "food", icon: "leave",    sellPrice: 5_000, heals: 60 }, // ¥10,000
  // 自家製ドリンク
  { id: "mint_tea",       name: "ミントティー",       type: "food", icon: "mint_tea",    sellPrice: 350,   heals: 14 }, // ¥700
  { id: "lemonade",       name: "レモネード",         type: "food", icon: "lemonade",    sellPrice: 600,   heals: 18 }, // ¥1,200
  { id: "grape_juice",    name: "ぶどうジュース",     type: "food", icon: "grape_juice", sellPrice: 800,   heals: 24 }, // ¥1,600
  {
    id: "homemade_energy",
    name: "自家製エナジードリンク",
    type: "food",
    icon: "energy_home",
    sellPrice: 1_200,
    heals: 42,
  }, // ¥2,400
];

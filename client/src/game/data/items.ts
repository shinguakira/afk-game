import type { Item } from "../types";

export const ITEMS: Item[] = [
  // ===== 資源 / 成果物 =====
  { id: "commit", name: "コミット", type: "resource", icon: "commit", sellPrice: 2 },
  { id: "product", name: "プロダクト", type: "product", icon: "product", sellPrice: 30 },

  // ===== 装備: 武器 (キーボード / マウス) =====
  {
    id: "membrane_kb", name: "メンブレンキーボード", type: "weapon", icon: "keyboard", sellPrice: 20,
    equip: { slot: "weapon", weapon: { attackBonus: 3, strengthBonus: 3, speed: 2800 } },
  },
  {
    id: "mechanical_kb", name: "メカニカルキーボード", type: "weapon", icon: "keyboard", sellPrice: 60,
    equip: { slot: "weapon", weapon: { attackBonus: 6, strengthBonus: 6, speed: 2500 } },
  },
  {
    id: "gaming_mouse", name: "ゲーミングマウス", type: "weapon", icon: "mouse", sellPrice: 50,
    equip: { slot: "weapon", weapon: { attackBonus: 9, strengthBonus: 4, speed: 2400 } },
  },
  {
    id: "hhkb", name: "HHKB", type: "weapon", icon: "keyboard", sellPrice: 130,
    equip: { slot: "weapon", weapon: { attackBonus: 11, strengthBonus: 9, speed: 2300 } },
  },
  {
    id: "realforce", name: "REALFORCE", type: "weapon", icon: "keyboard", sellPrice: 240,
    equip: { slot: "weapon", weapon: { attackBonus: 15, strengthBonus: 14, speed: 2200 } },
  },

  // ===== 装備: 服 (body) =====
  {
    id: "tshirt", name: "Tシャツ", type: "misc", icon: "shirt", sellPrice: 10,
    equip: { slot: "body", modifiers: [{ key: "power.maxHp", pct: 5 }] },
  },
  {
    id: "hoodie", name: "パーカー", type: "misc", icon: "shirt", sellPrice: 40,
    equip: { slot: "body", modifiers: [{ key: "power.maxHp", pct: 10 }, { key: "speed.gather", pct: 3 }] },
  },
  {
    id: "suit", name: "スーツ", type: "misc", icon: "shirt", sellPrice: 120,
    equip: { slot: "body", modifiers: [{ key: "gold", pct: 12 }, { key: "power.defence", pct: 10 }] },
  },
  {
    id: "workwear", name: "作業着", type: "misc", icon: "shirt", sellPrice: 60,
    equip: { slot: "body", modifiers: [{ key: "speed.craft", pct: 12 }] },
  },

  // ===== 装備: 髪型 (hair) =====
  {
    id: "bedhair", name: "寝癖ヘア", type: "misc", icon: "hair", sellPrice: 1,
    equip: { slot: "hair", modifiers: [{ key: "speed.gather", pct: 2 }] },
  },
  {
    id: "neat_hair", name: "七三分け", type: "misc", icon: "hair", sellPrice: 30,
    equip: { slot: "hair", modifiers: [{ key: "gold", pct: 6 }] },
  },
  {
    id: "afro", name: "アフロ", type: "misc", icon: "hair", sellPrice: 50,
    equip: { slot: "hair", modifiers: [{ key: "dropRate", pct: 10 }] },
  },
  {
    id: "ponytail", name: "ポニーテール", type: "misc", icon: "hair", sellPrice: 40,
    equip: { slot: "hair", modifiers: [{ key: "speed.gather", pct: 6 }] },
  },

  // ===== 装備: アイコン (avatar) =====
  {
    id: "av_default", name: "デフォルトアイコン", type: "misc", icon: "avatar", sellPrice: 1,
    equip: { slot: "avatar", modifiers: [] },
  },
  {
    id: "av_cat", name: "猫アイコン", type: "misc", icon: "avatar", sellPrice: 25,
    equip: { slot: "avatar", modifiers: [{ key: "dropRate", pct: 6 }] },
  },
  {
    id: "av_pixel", name: "ドット絵アイコン", type: "misc", icon: "avatar", sellPrice: 35,
    equip: { slot: "avatar", modifiers: [{ key: "xp.gather", pct: 6 }] },
  },
  {
    id: "av_anime", name: "アニメアイコン", type: "misc", icon: "avatar", sellPrice: 60,
    equip: { slot: "avatar", modifiers: [{ key: "dropRate", pct: 8 }, { key: "gold", pct: 4 }] },
  },

  // ===== 組み立てPC (pc) — pcbuild で作る =====
  {
    id: "pc_low", name: "エントリーPC", type: "misc", icon: "pc", sellPrice: 80,
    equip: { slot: "pc", modifiers: [{ key: "speed.gather", pct: 10 }, { key: "xp.gather", pct: 5 }] },
  },
  {
    id: "pc_mid", name: "ミドルレンジPC", type: "misc", icon: "pc", sellPrice: 260,
    equip: { slot: "pc", modifiers: [{ key: "speed.gather", pct: 20 }, { key: "speed.craft", pct: 15 }, { key: "xp.gather", pct: 10 }] },
  },
  {
    id: "pc_high", name: "ハイエンドPC", type: "misc", icon: "pc", sellPrice: 700,
    equip: { slot: "pc", modifiers: [{ key: "speed.gather", pct: 35 }, { key: "speed.craft", pct: 30 }, { key: "xp.gather", pct: 18 }, { key: "power.maxHit", pct: 10 }] },
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

  // ===== 食材 (ショップ購入 → 料理) =====
  { id: "rice", name: "米", type: "misc", icon: "rice", sellPrice: 2 },
  { id: "noodles", name: "麺", type: "misc", icon: "noodles", sellPrice: 2 },
  { id: "meat", name: "肉", type: "misc", icon: "meat", sellPrice: 4 },
  { id: "fish_ing", name: "魚", type: "misc", icon: "fish_food", sellPrice: 4 },
  { id: "veg", name: "野菜", type: "misc", icon: "veg", sellPrice: 2 },
  { id: "dough", name: "生地", type: "misc", icon: "dough", sellPrice: 3 },

  // ===== 飲食物 (food / 回復) =====
  { id: "water", name: "水", type: "food", icon: "water", sellPrice: 1, heals: 3 },
  { id: "coffee", name: "コーヒー", type: "food", icon: "coffee", sellPrice: 3, heals: 5 },
  { id: "cola", name: "コーラ", type: "food", icon: "cola", sellPrice: 3, heals: 7 },
  { id: "onigiri", name: "おにぎり", type: "food", icon: "onigiri", sellPrice: 4, heals: 9 },
  { id: "energy_drink", name: "エナジードリンク", type: "food", icon: "energy", sellPrice: 8, heals: 13 },
  { id: "cupramen", name: "カップ麺", type: "food", icon: "cupramen", sellPrice: 5, heals: 11 },
  { id: "bento", name: "弁当", type: "food", icon: "bento", sellPrice: 10, heals: 16 },
  { id: "ramen", name: "ラーメン", type: "food", icon: "ramen", sellPrice: 14, heals: 20 },
  { id: "gyudon", name: "牛丼", type: "food", icon: "gyudon", sellPrice: 15, heals: 22 },
  { id: "pizza", name: "ピザ", type: "food", icon: "pizza", sellPrice: 18, heals: 26 },
  { id: "sushi", name: "寿司", type: "food", icon: "sushi", sellPrice: 24, heals: 30 },
  { id: "steak", name: "ステーキ", type: "food", icon: "steak", sellPrice: 30, heals: 38 },
  { id: "paid_leave", name: "有給", type: "food", icon: "leave", sellPrice: 50, heals: 60 },

  // ===== その他ドロップ =====
  { id: "tech_debt", name: "技術的負債", type: "misc", icon: "techdebt", sellPrice: 1 },
  { id: "kudos", name: "感謝", type: "misc", icon: "kudos", sellPrice: 3 },
  { id: "cert", name: "資格", type: "misc", icon: "cert", sellPrice: 60 },
];

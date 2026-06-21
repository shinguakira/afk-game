# AFK Engineer — 実装仕様書（v1.0.0）

> ゲームデザイン・将来構想は `SPEC.md` を参照。本書は現在の実装をそのまま記述する。

---

## 1. プロダクト概要

**AFK Engineer** はエンジニアのキャリアをテーマにした Melvor Idle 系の放置（AFK）RPG。

### テックスタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Vite 6 + React 18 + TypeScript 5.7 |
| UI スタイル | Tailwind CSS v4 |
| 状態管理 | Zustand 5（スライス分割） |
| テスト | Vitest 3 + happy-dom |
| デスクトップラッパー | Tauri v2（Rust） |
| 開発用セーブサーバ | Express（Node.js）— `/api/save/:slot` |
| path alias | `@/` → `client/src/` |

### プラットフォーム

- **ブラウザ（Vite dev / Vercel 静的）**: localStorage をセーブ先として使用
- **デスクトップ（Tauri v2）**: `identifier: com.idleengineer.desktop` / ウィンドウ 1180×800px（min 900×620）/ ダークテーマ / セーブは localStorage
- **ローカル開発**: Express セーブサーバ（`/api/save/default`）が起動していれば JSON ファイル保存。localStorage にも複製。

---

## 2. アーキテクチャ

```
client/
  src/
    app/App.tsx              ← ルートコンポーネント・タブルーティング
    constants/               ← 全静的データ（skills, monsters, items, farming, prestige…）
    components/              ← UI コンポーネント
    lib/                     ← ゲームロジック（xp, combat, tick, persistence…）
    store/
      index.ts               ← useGame（Zustand store）
      types.ts               ← GameStore 型（SaveState + 7スライス）
      state.ts               ← makeStartingState / pickSaveState
      slices/                ← career / economy / farming / feedback / lifecycle / loop / onboarding
    types/                   ← save.ts / skills.ts / monsters.ts / items.ts / effects.ts…

src-tauri/                   ← Tauri v2 Rust バイナリ
server/                      ← Express セーブサーバ（開発用）
```

`GameStore = SaveState & FeedbackSlice & LifecycleSlice & OnboardingSlice & LoopSlice & EconomySlice & CareerSlice & FarmingSlice`

---

## 3. セーブシステム

### persistence.ts — デュアルモード

```
loadSave():
  1. GET /api/save/default
     - 200 → serverOk=true, JSON を返す
     - 404 → serverOk=true, null を返す（新規）
     - fetch 失敗 → serverOk=false, localStorage から読む

writeSave():
  - 常に localStorage にも書く（key: "afk-save-default"）
  - serverOk=false なら localStorage のみ
  - serverOk!=false なら POST /api/save/default も試みる

flushSaveOnUnload():
  - beforeunload 時。localStorage + navigator.sendBeacon
```

- `serverOk` は `boolean | null` のモジュールレベル変数。初回 load で決定。
- Tauri / Vercel では Express サーバが不在のため `serverOk=false` となり localStorage が実質的なセーブ先。

### セーブバージョン

- `SAVE_VERSION = 20`（`constants/config.ts`）
- バージョン不一致時は `migrate.ts` の `migrateSave()` が変換を試みる
- 変換経路が無い場合 `null` を返し、`lifecycle.ts` の `init()` が警告ログを出して新規状態で開始
- 現状 `MIGRATIONS = {}`。マイグレーションが必要な世代から `MIGRATIONS[n]` に関数を追加する設計。

### SaveState スキーマ

```typescript
interface SaveState {
  version: number;
  skills: Record<string, { xp: number }>;
  bank: Record<string, number>;           // アイテムid → 所持数
  plots: PlotState[];                     // 農業畑（PLOT_COUNT=4）
  gold: number;
  jobClass: string | null;
  prestigePoints: number;
  prestigeUpgrades: Record<string, number>;
  prestigeCount: number;
  milestones: string[];                   // 達成済みマイルストーンid
  equipment: Partial<Record<EquipSlot, string>>;
  selectedFood: string | null;
  playerName: string;
  mainLang: string | null;
  interestLangs: string[];
  onboarded: boolean;
  playerHp: number;
  active: ActiveAction;
  actionProgress: number;
  lastSaved: number;                      // Date.now()
}

type ActiveAction =
  | { kind: "skill"; actionId: string }
  | { kind: "combat"; monsterId: string }
  | null;
```

### オフライン進行

- `init()` 時に `elapsed = Date.now() - lastSaved` を計算
- `elapsed > 3000` かつ `active` または作物あり → `simulateOffline(base, min(elapsed, MAX_OFFLINE_MS))`
- `MAX_OFFLINE_MS = 86_400_000` ms（24時間キャップ）
- `active` があった場合のみ「おかえりモーダル」表示。作物は常に成長。

---

## 4. ゲームループ

### setInterval ベースのループ

```typescript
// lifecycle.ts の init() 内
let last = performance.now();
window.setInterval(() => {
  const now = performance.now();
  const dt = Math.min(now - last, 5000); // 最大5秒クランプ（タブ非表示対策）
  last = now;
  get().tick(dt);
}, TICK_MS); // 100ms 間隔
```

### tick(dt) の処理順

1. `runSkillTick(set, get, dt)` — `active.kind === "skill"` の場合
2. `runCombatTick(set, get, dt)` — `active.kind === "combat"` の場合
3. `advancePlots(set, get, dt)` — active に関わらず毎 tick、畑の成長を進める
4. `checkRoadmap()` — 毎 tick。達成済み未マークのマイルストーンを走査して報酬付与

### 主要タイミング定数

| 定数 | 値 | 用途 |
|---|---|---|
| `TICK_MS` | 100 ms | ゲームループ間隔 |
| `SAVE_EVERY_MS` | 15,000 ms | 自動セーブ間隔 |
| `MAX_OFFLINE_MS` | 86,400,000 ms（24h） | オフライン進行上限 |
| `LOG_LIMIT` | 40 件 | ログパネル保持件数 |
| `TOAST_MS` | 4,200 ms | トースト自動消滅 |
| `XP_FLASH_MS` | 3,500 ms | XP インジケータ表示時間 |

### React StrictMode 対策

`loopStarted` フラグ（モジュールレベル）を使い、`init()` の二重呼び出しでループが2本立ち上がるのを防いでいる。

---

## 5. スキルシステム

### スキルカテゴリ

| category | 説明 | スキルid 例 |
|---|---|---|
| `language` | プログラミング言語 | `js`, `ts`, `python`, `rust`, `go`… |
| `platform` | 領域・プラットフォーム | `plat_web`, `plat_game`, `plat_mobile`, `plat_embedded`, `plat_ai`, `plat_data` |
| `infra` | インフラ・基盤 | `inf_linux`, `inf_docker`, `inf_kubernetes`, `inf_terraform`, `inf_aws`, `inf_gcp`, `inf_azure`, `inf_nginx`, `inf_database` |
| `domain` | 業界ドメイン | `dom_fintech`, `dom_ec`, `dom_healthcare`, `dom_legal`, `dom_public` |
| `craft` | クラフト系 | `farming`, `cooking`, `pcbuild`, `electronics` |
| `combat` | 現場力（戦闘ステータス） | `debug`, `impl`, `robust`, `mental` |

### 戦闘ステータスマッピング

```typescript
export const STAT = {
  accuracy: "debug",   // 命中
  damage:   "impl",    // ダメージ
  defence:  "robust",  // 防御
  mental:   "mental",  // HP
} as const;
```

- 初期 `mental` レベル: `STARTING_MENTAL_LEVEL = 10`（`xpForLevel(10)` 相当の XP でスタート）

### 言語スキル一覧（30言語）

| グループ | スキルid |
|---|---|
| スクリプト系 | `js`, `ts`, `python`, `ruby`, `php`, `lua`, `perl` |
| システム系 | `c`, `cpp`, `rust`, `go`, `zig` |
| JVM / .NET 系 | `java`, `kotlin`, `scala`, `csharp` |
| ネイティブ / モバイル | `swift`, `dart`, `objc` |
| 関数型 | `haskell`, `elixir`, `clojure`, `fsharp`, `erlang` |
| データ / 科学 | `r`, `julia`, `sql` |
| レガシー | `cobol`, `fortran`, `asm` |

### XP テーブル（RuneScape 方式）

```typescript
// 累積XP計算式
function cumulativeXp(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += Math.floor(l + 300 * Math.pow(2, l / 7));
  }
  return Math.floor(total / 4);
}
```

テーブルは事前計算（`TABLE: number[]`）。`TABLE_MAX = 120`（`INTEREST_LANG_CAP`）まで計算。

### レベルキャップ

| スキル属性 | 上限 |
|---|---|
| デフォルト | `MAX_LEVEL = 99` |
| `mainLang`（得意言語） | `MAIN_LANG_CAP = 110` |
| `interestLangs`（興味言語） | `INTEREST_LANG_CAP = 120` |

```typescript
export function langLevelCap(mainLang, interestLangs, skillId): number {
  if (mainLang === skillId) return 110;
  if (interestLangs.includes(skillId)) return 120;
  return 99;
}
```

### XP 倍率（言語アフィニティ）

```typescript
export function langXpMult(mainLang, interestLangs, skillId): number {
  if (mainLang === skillId) return 1.20;   // +20%
  if (interestLangs.includes(skillId)) return 1.10; // +10%
  return 1.0;
}
```

### XP 参考値

| レベル | 累積 XP |
|---|---|
| 99 | 13,034,431 |
| 110 | 38,737,661 |
| 120 | 104,273,167 |

---

## 6. アクションシステム

### GameAction 型

```typescript
interface GameAction {
  id: string;
  skill: string;               // 付与スキルid
  name: string;
  category?: ActionCategory;   // "base"|"concept"|"library"|"framework"|"oss"|"cert"
  icon?: string;
  level: number;               // 解禁に必要なスキルレベル
  time: number;                // 1回の完了時間（ms）
  xp: number;                  // 主スキルに入る XP
  url?: string;
  xpAlso?: { skill: string; xp: number };  // 副次XP（同時獲得）
  inputs?: Record<string, number>;          // craft アクション: 消費アイテム
  outputs: Record<string, number>;          // 生産アイテム
}
```

### アクション実行フロー（runSkillTick）

1. `actionTiming(action, eff)` で有効時間・XP/回を取得
2. `progress += dt` → `while progress >= effTime` でループ
3. craft は `inputs` チェック → 素材切れなら停止
4. outputs を bank に追加、xpGained 積算
5. 言語倍率 `langXpMult` × モディファイア倍率を乗算してスキルへ付与
6. `xpAlso` があれば副次スキルにも付与
7. レベルアップ判定 → トースト通知

### フレームワーク → 領域 XP の橋渡し

フレームワークアクションに `xpAlso: { skill: "plat_${platform}", xp: round(fxp * 0.6) }` を付与することで、フレームワーク実装が言語（主、100%）と領域（副、60%）を同時に伸ばす。

---

## 7. コンバットシステム

### Monster 型

```typescript
interface Monster {
  id: string; name: string; icon: string;
  hp: number; maxHit: number; attack: number; defence: number;
  speed: number;   // 攻撃間隔（ms）
  xp: number; goldMin: number; goldMax: number;
  loot: LootDrop[];
  dot?: number;    // メンタルへの継続ダメージ（毎秒）
  regen?: number;  // 自己回復（HP/秒）
  weakTo?: string; // 特攻言語スキルid
  xpAlso?: { skill: string; xp: number };
}
```

### モンスター構成（合計 80体）

#### MONSTER_LANG_DEFS（10言語）

| 言語id | mult | xpFactor |
|---|---|---|
| php | 0.90 | 3 |
| ruby | 0.95 | 3 |
| javascript | 1.00 | 4 |
| python | 1.00 | 4 |
| java | 1.05 | 4 |
| csharp | 1.05 | 4 |
| typescript | 1.10 | 5 |
| kotlin | 1.10 | 5 |
| go | 1.15 | 5 |
| rust | 1.30 | 6 |

`mult` は HP / attack / defence / xp / goldMin / goldMax に乗算。maxHit と speed は共通。言語XP = `round(baseXp / 10 * xpFactor)`

#### テンプレート（7種）× 10言語 = 70体

| id | 名前 | HP | maxHit | attack | defence | speed | xp | goldMin | goldMax | 特性 |
|---|---|---|---|---|---|---|---|---|---|---|
| bugfix | バグ修正 | 6 | 1 | 2 | 1 | 3000 | 12 | 500 | 1,500 | — |
| lp | LP制作 | 12 | 1 | 3 | 3 | 3200 | 22 | 10,000 | 25,000 | — |
| spec_change | 仕様変更 | 18 | 2 | 6 | 5 | 3000 | 30 | 8,000 | 20,000 | regen 1.2 |
| feature | 機能開発 | 26 | 3 | 10 | 8 | 2800 | 46 | 15,000 | 40,000 | — |
| review | コードレビュー | 22 | 3 | 9 | 13 | 2800 | 44 | 5,000 | 15,000 | — |
| webapp | Webアプリ受託 | 40 | 4 | 14 | 12 | 2700 | 80 | 30,000 | 80,000 | — |
| incident | 緊急障害対応 | 34 | 5 | 16 | 9 | 2400 | 72 | 10,000 | 30,000 | DoT 1.5 |

#### 特殊案件（言語固有）

| id | 名前 | weakTo | 特性 |
|---|---|---|---|
| ts_type_err | TypeScript型エラー | typescript | — |
| py_memleak | Pythonメモリリーク | python | regen 0.8 |
| go_goroutine | Goroutineリーク | go | regen 1.0 |
| rust_compile | Rust所有権エラー | rust | defence 35 |
| sql_n1 | SQL N+1問題 | sql | regen 1.2 |
| enjou | 炎上案件 | — | DoT 3.0, goldMax 250,000 |

#### 上位案件（言語非依存）

| id | 名前 | HP | xp | goldMax | 特性 |
|---|---|---|---|---|---|
| techdebt | 技術的負債解消 | 45 | 90 | 80,000 | DoT 1.0 |
| newproject | 新規PJT立ち上げ | 58 | 110 | 150,000 | regen 0.65 |
| perf_issue | パフォーマンス障害 | 50 | 130 | 120,000 | regen 1.5 |
| migration | システム移行 | 80 | 160 | 250,000 | regen 2.0 |

### getCombatStats() — プレイヤー戦闘ステータス

```typescript
maxHit        = floor((1 + strengthLevel * 0.4 + weapon.strengthBonus) * mult(eff, "power.maxHit"))
attackRating  = round((2 + attackLevel * 2 + weapon.attackBonus) * mult(eff, "power.accuracy"))
defenceRating = round((5 + defenceLevel * 2) * mult(eff, "power.defence"))
weaponSpeed   = round(weapon.speed / mult(eff, "speed.combat"))
maxHp         = floor(hitpointsLevel * 10 * mult(eff, "power.maxHp"))
```

- `strengthLevel = levelForXp(skills["impl"].xp)`
- `attackLevel = levelForXp(skills["debug"].xp)`
- `defenceLevel = levelForXp(skills["robust"].xp)`
- `hitpointsLevel = levelForXp(skills["mental"].xp)`

### 命中・ダメージ

```typescript
playerHitChance = attackRating / (attackRating + monster.defence)
enemyHitChance  = monster.attack / (monster.attack + defenceRating)
weakMult        = 1 + levelForXp(skills[monster.weakTo].xp) / 100  // 特攻補正（最大 +99%）
playerDamage    = ceil(randInt(1, maxHit) * weakMult)
enemyDamage     = randInt(1, monster.maxHit)
```

### 戦闘の進行（runCombatTick）

- `playerTimer += dt`, `enemyTimer += dt`
- 攻撃タイミング: `playerTimer >= weaponSpeed` / `enemyTimer >= monster.speed`
- DoT: `playerHp -= monster.dot * (dt / 1000)`
- regen: `enemyHp = min(monster.hp, enemyHp + monster.regen * (dt / 1000))`
- 自動食事: `playerHp <= maxHp * 0.5` かつ `selectedFood` あり → bank から1個消費して回復
- 死亡: `playerHp <= 0` → `playerHp = maxHp` に蘇生し `active = null`（戦闘離脱）

### 戦闘 XP 分配

撃破 XP プール `monster.xp` を `debug`, `impl`, `robust`, `mental` の4スキルに均等分配（各 `xp/3`）。

### CombatView のグルーピング

- デフォルト表示: 言語グループ別（`weakTo` で判定）、mainLang を先頭に priority sort
- 言語チップフィルター（複数選択可）+ テキスト検索の AND フィルター
- 1言語選択時: タスク名のみ表示（"バグ修正"）。複数選択時: フルネーム（"Rustのバグ修正"）

---

## 8. 経済システム

### 基本規則

- **1 gold = 1 円**
- `STARTING_GOLD = 10,000`
- `STARTING_BANK = { coffee: 10 }`
- `SHOP_MARKUP = 2`（ショップ購入価格 = `sellPrice × 2`）

### 武器（キーボード / マウス）— sellPrice

| id | 名前 | sellPrice | ショップ価格 | attackBonus | strengthBonus | speed |
|---|---|---|---|---|---|---|
| membrane_kb | メンブレンキーボード | 1,250 | ¥2,500 | 3 | 3 | 2,800 |
| mechanical_kb | メカニカルキーボード | 7,500 | ¥15,000 | 6 | 6 | 2,500 |
| gaming_mouse | ゲーミングマウス | 6,000 | ¥12,000 | 9 | 4 | 2,400 |
| hhkb | HHKB | 18,500 | ¥37,000 | 11 | 9 | 2,300 |
| realforce | REALFORCE | 17,500 | ¥35,000 | 15 | 14 | 2,200 |

### 装備スロット

`"weapon" | "body" | "bag" | "hair" | "avatar" | "pc"`

### PC（pcbuild でクラフト）— sellPrice

| id | sellPrice | ショップ価格 | 主な補正 |
|---|---|---|---|
| pc_low | 25,000 | ¥50,000 | gather速度+10%, gatherXP+5% |
| pc_mid | 75,000 | ¥150,000 | gather+20%, craft+15%, XP+10% |
| pc_high | 250,000 | ¥500,000 | gather+35%, craft+30%, XP+18%, maxHit+10% |

### 食料（HP回復量 `heals`）

| id | 名前 | sellPrice | heals |
|---|---|---|---|
| water | 水 | 55 | 3 |
| coffee | コーヒー | 75 | 5 |
| energy_drink | エナジードリンク | 140 | 13 |
| bento | 弁当 | 300 | 16 |
| paid_leave | 有給 | 5,000 | 60 |

---

## 9. ランク / キャリアシステム

### ランク昇進（totalLevel 閾値）

| rank.index | 名称 | totalLevel |
|---|---|---|
| 0 | 見習い | 0 |
| 1 | ジュニア | 30 |
| 2 | ミドル | 80 |
| 3 | シニア | 160 |
| 4 | テックリード | 280 |
| 5 | 役員 | 450 |
| 6 | 社長 | 700 |

`totalLevel(state)` = 全スキルの `levelForXp(xp, langLevelCap(...))` の合計。

### 職種クラス（jobClass）

ミドル昇進（rank ≥ 2）で選択解禁。

#### 基本職

| id | 名前 | 主な補正 |
|---|---|---|
| frontend | フロントエンド | craft速度+20%, dropRate+15%, combat速度-8% |
| backend | バックエンド | maxHit+25%, defence+10%, gather速度-10% |
| sre | インフラ/SRE | craft速度+35%, maxHp+15%, maxHit-10% |
| data | データサイエンティスト | dropRate+35%, gatherXP+15% |
| qa | QA | defence+40%, combatXP+10% |
| pm | PM | 全XP+12%, gold+20% |

#### 見習い職（rank 1 以上）

| id | 名前 | 主な補正 |
|---|---|---|
| tester | テスター | defence+15%, combatXP+10%, dropRate+8% |
| excel_ppt | エクセルパワポ職人 | craft速度+90%, gold+15%, maxHit-90% |

#### 上位職（テックリード rank 4 以上）

| id | 名前 | upgradesFrom |
|---|---|---|
| fullstack | フルスタック | frontend, backend |
| security | セキュリティ | backend, sre |
| ml_eng | MLエンジニア | data |
| devrel | DevRelエンジニア | pm, frontend |
| platform_eng | プラットフォームエンジニア | sre |

#### 最上位職（役員 rank 5 以上）

| id | 名前 | upgradesFrom |
|---|---|---|
| cto | CTO | fullstack, ml_eng |
| vp_eng | VPoE | security, platform_eng |

### プレステージ（起業）

- 条件: シニア以上（rank ≥ 3）
- 実行: スキル・gold・bank リセット → `prestigeCount++`、`prestigePoints += gain`
- 永続引き継ぎ: `prestigePoints`, `prestigeUpgrades`, `prestigeCount`, `milestones`

#### プレステージアップグレード（6種、各 max Lv5）

| id | 名前 | 効果 / Lv |
|---|---|---|
| funding | 資金調達 | gold +12% |
| automation | 自動化 | gather速度 +10% |
| tech | 技術力 | craft速度 +8%, craftXP +6% |
| brand | ブランド力 | dropRate +15% |
| wellness | メンタルケア | maxHp +10% |
| delivery | 開発力 | maxHit +8%, accuracy +8% |

---

## 10. 農業システム

### 定数

- `PLOT_COUNT = 4`
- `TEND_BOOST = 2.5`（手入れアクション中の成長加速倍率）

### PlotState

```typescript
interface PlotState {
  crop: string | null;  // 植えている作物id
  growth: number;       // 経過成長（ms）
}
```

収穫: `growth >= spec.growMs` になったら `harvestPlot(index)` で手動収穫。

### 作物一覧（抜粋）

| id | 解禁Lv | 成長時間 | 収穫数 | farming XP | 種 |
|---|---|---|---|---|---|
| parsnip | 1 | 4h | 8 | 120 | 不要 |
| tomato | 1 | 30min | 3 | 25 | seed_tomato |
| shiitake | 8 | 3h | 9 | 200 | seed_shiitake |
| apple | 13 | 6h | 15 | 460 | seed_apple |
| coffee_bean | 9 | 3h | 4 | 190 | seed_coffee |

### 手入れアクション

| id | 名前 | 解禁Lv | time | farming XP |
|---|---|---|---|---|
| farm_till | 土を整える | 1 | 2,800ms | 12 |
| farm_water | 水やりをする | 1 | 2,600ms | 10 |
| farm_fertilize | 肥料をまく | 4 | 3,200ms | 22 |

---

## 11. ロードマップ（マイルストーン）

### MILESTONES 一覧

| id | タイトル | axis | 条件 | 報酬（gold） |
|---|---|---|---|---|
| first_commit | 初コミット | tech | 任意言語 Lv ≥ 2 | 50 |
| first_framework | フレームワーク解禁 | tech | 任意言語 Lv ≥ 5 | 150 |
| first_device | デバイスを装備 | money | equipment.weapon あり | 100 |
| savings_1k | 貯金 ¥1,000 | money | gold ≥ 1,000 | 200 |
| first_class | 職種を選ぶ | rank | jobClass あり（≠ "none"） | 300 |
| first_pc | 自作PCを組む | tech | equipment.pc あり | 400 |
| polyglot_3 | 3言語を Lv15 | tech | 3言語 Lv ≥ 15 | 800 |
| senior | シニアに昇進 | rank | rank.index ≥ 3 | 1,000 |
| savings_100k | 貯金 ¥100,000 | money | gold ≥ 100,000 | 5,000 |
| first_startup | 初めての起業 | meta | prestigeCount ≥ 1 | — |
| goal_moon | 月を購入 | money | gold ≥ 1,000,000,000 | — |
| goal_new_language | 新しい言語を開発 | tech | 10言語 Lv ≥ 50 | — |

---

## 12. UI コンポーネント構成

### レイアウト

```
┌─────────────────────── TopBar（全幅） ───────────────────────┐
├── Sidebar（210px） ── メインエリア（1fr） ── LogPanel（280px） ─┤
└──────────────────────────────────────────────────────────────┘
```

### コンポーネント一覧

| ファイル | 役割 |
|---|---|
| `App.tsx` | ルート。タブルーティング、init 呼び出し |
| `TopBar.tsx` | プレイヤー名・gold・HP バー・セーブ/リセット・UpdateChecker |
| `Sidebar.tsx` | スキル・機能タブのナビゲーション |
| `SkillView.tsx` | 特定スキルのアクション一覧・進捗バー |
| `CombatView.tsx` | 言語別モンスターグループ・検索フィルター・戦闘状況 |
| `BankView.tsx` | 所持アイテム一覧・売却 |
| `ShopView.tsx` | アイテム購入 |
| `FarmingView.tsx` | 畑 4区画・植える・収穫 |
| `CareerView.tsx` | 職種選択・ランク表示 |
| `PrestigeView.tsx` | 起業ボタン・永続アップグレード購入 |
| `EquipView.tsx` | 装備スロット管理・着脱 |
| `RoadmapView.tsx` | マイルストーン一覧・達成状況 |
| `LogPanel.tsx` | ゲームログ（直近 LOG_LIMIT=40 件） |
| `OfflineModal.tsx` | おかえりモーダル（OfflineSummary 表示） |
| `OnboardingModal.tsx` | 初回オンボーディング（名前・言語選択） |
| `TutorialOverlay.tsx` | チュートリアルオーバーレイ |
| `ToastHost.tsx` | トースト通知ホスト |
| `UpdateChecker.tsx` | Tauri 専用アップデート確認・適用（起動4秒後に自動チェック） |
| `DebugView.tsx` | DEV 限定デバッグビュー（`tab === "dataview"` で表示） |
| `Bar.tsx` | 汎用プログレスバー |
| `TimerBar.tsx` | アクション進行バー（アニメーション） |

---

## 13. Zustand ストア構成

| スライス | ファイル | 担当範囲 |
|---|---|---|
| LifecycleSlice | `slices/lifecycle.ts` | `ready`, `init()`, `saveNow()`, `hardReset()` |
| FeedbackSlice | `slices/feedback.ts` | `log`, `toasts`, `xpFlash`, `offlineSummary`, pushLog/Toast/flashXp/dismissOffline |
| LoopSlice | `slices/loop.ts` | `enemyHp`, `playerTimer`, `enemyTimer`, `tick()`, `startAction()`, `startCombat()`, `stop()` |
| EconomySlice | `slices/economy.ts` | `equip()`, `unequip()`, `setFood()`, `sell()`, `buyItem()` |
| CareerSlice | `slices/career.ts` | `setClass()`, `prestige()`, `buyPrestigeUpgrade()`, `checkRoadmap()` |
| FarmingSlice | `slices/farming.ts` | `plantCrop()`, `harvestPlot()` |
| OnboardingSlice | `slices/onboarding.ts` | `tutorialStep`, `completeOnboarding()`, `setTutorialStep()`, `endTutorial()`, `restartTutorial()` |

---

## 14. 定数 / 設定（constants/config.ts）

| 定数 | 値 | 説明 |
|---|---|---|
| `SAVE_VERSION` | 20 | セーブスキーマ世代 |
| `TICK_MS` | 100 | ゲームループ間隔（ms） |
| `SAVE_EVERY_MS` | 15,000 | 自動セーブ間隔（ms） |
| `MAX_OFFLINE_MS` | 86,400,000（24h） | オフライン進行上限（ms） |
| `LOG_LIMIT` | 40 | ログ保持件数 |
| `TOAST_MS` | 4,200 | トースト表示時間（ms） |
| `XP_FLASH_MS` | 3,500 | XP インジケータ表示時間（ms） |
| `SHOP_MARKUP` | 2 | ショップ購入価格倍率 |
| `STARTING_GOLD` | 10,000 | 開始時の所持金 |
| `STARTING_BANK` | `{ coffee: 10 }` | 開始時の所持アイテム |
| `HP_PER_MENTAL_LEVEL` | 10 | mental Lv 1 あたりの最大 HP |
| `STARTING_MENTAL_LEVEL` | 10 | mental 初期レベル相当 XP |
| `ONBOARD_MAIN_LEVEL` | 5 | オンボーディング得意言語の初期 Lv |
| `ONBOARD_INTEREST_LEVEL` | 2 | オンボーディング興味言語の初期 Lv |

---

## 15. デスクトップ配布 / アップデート

### Tauri v2 ビルド

```bash
npm run desktop:build   # = tauri build
```

生成物（Windows）:
- `src-tauri/target/release/bundle/nsis/AFK Engineer_x.x.x_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/AFK Engineer_x.x.x_x64_en-US.msi`

### アップデーター構成

- プラグイン: `tauri-plugin-updater` + `tauri-plugin-process`
- 署名: Ed25519 keypair（`npx tauri signer generate -w ./tauri-signing.key`）
- エンドポイント: `tauri.conf.json > plugins.updater.endpoints`
- フロントエンド: `UpdateChecker.tsx` が起動 4秒後に自動チェック。新バージョンあり → TopBar にボタン表示 → クリックでダウンロード & 再起動

### GitHub Actions リリースフロー

`v*` タグ push → `.github/workflows/release.yml` が起動 → ビルド & 署名 & GitHub Release 作成 → `latest.json` アップロード

必要な GitHub Secrets:
- `TAURI_SIGNING_PRIVATE_KEY` — 秘密鍵の内容
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — パスワード（空文字可）

### セーブデータの永続性

- Tauri の WebView2 データは `%APPDATA%\Roaming\com.afkengineer.desktop\` に保存
- NSIS インストーラーでの上書きアップデートではこのフォルダは消えない（セーブ引き継ぎ可）
- アンインストール後の再インストールではデータが消える可能性あり

---

## 付録: オフライン戦闘シミュレーション

`simulateOffline` は解析的推定でオフライン分を適用:

1. `dpsPerMs = avgPlayerDamage / weaponSpeed`
2. `effDpsPerMs = max(0.00001, dpsPerMs - regen/1000)`
3. `killTime = monster.hp / effDpsPerMs`
4. `dmgTakenPerKill = avgEnemyDamage * (killTime / monster.speed) + dot * (killTime / 1000)`
5. `killsByTime = floor(ms / killTime)`, `killsByHp = floor(hpPool / dmgTakenPerKill)`
6. `kills = min(killsByTime, killsByHp)`
7. 報酬（gold / loot / XP）を kills 分まとめて適用

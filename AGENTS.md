# AGENTS.md — このリポジトリで作業するエージェントへの規約

## アイコン（厳守）

- **「近いから」で別物のアイコンを流用するな。** 手抜き厳禁。
  - 例: トマトに 🍒 cherry、いちごに cherry、にんじんに salad ── こういう“それっぽい代用”は禁止。
  - その物に**実際に見えない**アイコンを当てた時点でアウト。
- アイテム・作物・具体物のアイコンは **その物を正しく表す**こと。
  - lucide / simple-icons に**ぴったりの絵が無いなら、`client/src/components/itemIcons.tsx` に自作SVGを描く**
    （`viewBox="0 0 24 24"`・フラット・枠いっぱい）。`ITEM_ICONS` はアイコンレジストリより**優先**される。
  - 「ライブラリに無い＝近いやつで妥協」ではなく「**無いなら描く**」。
- ブランドのある技術（言語/フレームワーク/クラウド/DB/OSS）は **simple-icons の正式ロゴ＋ブランド色**を使う。近似しない。
- 迷ったら自問: **「これは本当にその物に見えるか?」** 見えないなら自作SVGを描く。

## モンスターテスト（義務）

`client/src/constants/monsters.ts` にモンスターを追加・変更したら、
**必ず** `client/test/combat-threshold.test.ts` に以下を追加する。

### 1. 最低均衡レベルの登録

ファイル冒頭の `expected` テーブルに、新モンスターの最低均衡レベルを追加する。

```ts
const expected: Record<string, number> = {
  // 既存…
  new_monster: XX, // ← findMinBalancedLevel("new_monster") で導出した値
};
```

`findMinBalancedLevel` は debug = impl = robust = lv、mental = max(lv, 10) で
Lv1 から総当たりし、`survives=true` になる最小レベルを返す。
まず値を確認してから登録すること（値が違うとテストが失敗する）。

### 2. モンスター固有の `describe` ブロック

モンスターごとに **最低 3〜4 個** のテストを含む `describe` ブロックを追加する。

```ts
describe("モンスター名 (hp:XX def:XX atk:XX maxHit:XX spd:XXXXms [regen:X.X] [dot:X.X/s])", () => {
  // ① 最低レベル境界: minLv-1 では生存不可、minLv では生存
  test("Lv(minLv-1): cannot survive", () => { ... });
  test("Lv(minLv): survives", () => { ... });

  // ② そのモンスター固有のメカニクスを検証 (2つ以上)
  //   regen 持ち → DPS がリジェネを超えられない境界を確認
  //   dot 持ち   → impl を上げると dot 被弾時間が短縮することを確認
  //   高防御      → debug vs impl の DPS 優位性を確認
  //   など
});
```

必須テストのチェックリスト:

- [ ] `minLv - 1` で `survives=false` を確認するテスト
- [ ] `minLv` で `survives=true` を確認するテスト
- [ ] モンスター固有のギミック（`regen`/`dot`/高防御）に関するテスト 1〜2 個
- [ ] ステータスの貢献分析（どのスキルが最も効くか）を示すテスト 1 個（任意だが推奨）

> **なぜ必要か**: combat.ts の数式が変わったとき、どのモンスターの
> 挙動が崩れたかをテストが即座に教える。また「このモンスターに最低
> どのレベルが必要か」が読み手に伝わる唯一のドキュメントになる。

## その他の確立済み規約

- **バレルファイル禁止**。再エクスポートだけの `index.ts`（`export * from "./x"` 等）を作らない。
  各シンボルは定義元モジュールから直接 import する（例: `from "../constants/items"`、`from "../constants"` ではない）。
  ルックアップマップ等の派生値は「それを計算する実体モジュール」（例 `constants/maps.ts`）に置く。
- **動的インポート禁止**。`await import(...)` も `import(...).X` 型クエリも使わない。静的な top-level `import` / `import type` のみ。
- **string エイリアス型を作らない**。`type ItemId = string` のような素の primitive への命名再代入は禁止。直接 `string` を使う。
- **値が予測できる（有限集合の）ものは `string` ではなく literal union を使う**。例: `kind: "skill" | "combat"`、`slot: "weapon" | ...`。
  固定enum（種別/スロット/カテゴリ/効果キー）は union 必須。一方、コンテンツで増える id（item/skill/言語 id 等）や自由入力（名前/URL）は `string` のままで良い。
  有限集合がデータ配列にあるなら `(typeof ARR)[number]["id"]` で導出（ただし types/ にデータを import しない＝循環回避のためデータ側で導出）。
- **フォルダ構成**は `client/src/{app,components,store,lib,constants,types}`（各役割は README 参照）。loose な .ts を src 直下に置かない。
  - `components/` = 画面/UI、`store/` = Zustand、`lib/` = ロジック、`constants/` = データ駆動定義、`types/` = 型。
  - 型は `types/` にドメイン別で分割（items/skills/monsters/save/effects/ui…）。1つの `index.ts` に詰めない。type と interface は同列に扱い、重複させない。
- **絵文字をUIに使わない**。アイコンは lucide / simple-icons / 自作SVG のいずれか。
- **永続セーブのスキーマは `client/src/types/save.ts`（`SaveState`）に閉じる**。実行時/UIの一時状態や `OfflineSummary` 等の非永続DTOは混ぜない。
  これを変更したら `client/src/constants/config.ts` の `SAVE_VERSION` を上げる。将来このスキーマ世代間のマイグレーションを書く前提。
- データ変更で**経済やアイテム集合が変わったら**も同様に `SAVE_VERSION` を上げる。
- 変更後は必ず通す（ルートで）:
  - `cd client && npx tsc --noEmit`
  - `npm test`（vitest・`client/test/`。全 pass 必須）
  - `npm run build`
- コミット前に整形＆Lintを通す（ルートで）:
  - `npm run format`（oxfmt・既定で書込）
  - `npm run lint`（oxlint・警告ゼロを維持）
  - `npm run knip`（不要なexport/依存/ファイルの検出。型のみのexportは許容）
- 設計判断・仕様変更は `docs/SPEC.md` に記録する。
- スキル知識の4軸（言語 / 領域・プラットフォーム / インフラ・基盤 / 業界ドメイン）と
  「知的活動が生むのは commit のみ・アイテムを生むのは物理制作のみ」の原則を崩さない（詳細は SPEC §0-11b〜e）。

## バージョン管理（厳守）

**ユーザーから「バージョンを上げて」「リリースして」と明示的に指示されない限り、バージョン番号を変更してはならない。**

変更箇所は必ず4箇所セット:
- `package.json`（ルート）
- `client/package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

4箇所を同一バージョンに揃えること。一部だけ変更するのは禁止。

## リリース手順

### 1. バージョン番号を更新（指示があった場合のみ）

上記4箇所を新バージョンに更新する。

### 2. ビルド確認

```powershell
npm test          # テスト全 pass 確認
npm run build     # フロントエンドビルド確認
```

### 3. commit & push

```powershell
git add -A
git commit -m "release: vX.X.X"
git push origin master
```

### 4. タグを打つ → GitHub Actions が自動でリリース作成

```powershell
git tag vX.X.X
git push origin vX.X.X
```

GitHub Actions（`.github/workflows/release.yml`）が起動し、以下を自動で行う:
- Tauri デスクトップアプリのビルド（Windows）
- 署名キー（`TAURI_SIGNING_PRIVATE_KEY`）でインストーラーに署名
- GitHub Release を Draft で作成（タイトル: `AFK Engineer vX.X.X`）
- アセットをアップロード:
  - `AFK Engineer_X.X.X_x64-setup.exe`（NSIS インストーラー）
  - `AFK Engineer_X.X.X_x64_en-US.msi`（MSI）
  - `latest.json`（アップデーター用バージョン情報）

### 5. Draft を公開

GitHub の Releases ページでリリースノートを書いて「Publish release」する。
公開後、既存ユーザーのアプリ起動時に「vX.X.X に更新」ボタンが自動表示される。

### 署名キーの場所

- 秘密鍵: `tauri-signing.key`（gitignore 済み・絶対に commit しない）
- 公開鍵: `tauri-signing.key.pub`（commit 済み・`tauri.conf.json` の `pubkey` に反映済み）
- GitHub Secrets に設定済み: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

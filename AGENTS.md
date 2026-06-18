# AGENTS.md — このリポジトリで作業するエージェントへの規約

## アイコン（厳守）

- **「近いから」で別物のアイコンを流用するな。** 手抜き厳禁。
  - 例: トマトに 🍒 cherry、いちごに cherry、にんじんに salad ── こういう“それっぽい代用”は禁止。
  - その物に**実際に見えない**アイコンを当てた時点でアウト。
- アイテム・作物・具体物のアイコンは **その物を正しく表す**こと。
  - lucide / simple-icons に**ぴったりの絵が無いなら、`client/src/ui/itemIcons.tsx` に自作SVGを描く**
    （`viewBox="0 0 24 24"`・フラット・枠いっぱい）。`ITEM_ICONS` はアイコンレジストリより**優先**される。
  - 「ライブラリに無い＝近いやつで妥協」ではなく「**無いなら描く**」。
- ブランドのある技術（言語/フレームワーク/クラウド/DB/OSS）は **simple-icons の正式ロゴ＋ブランド色**を使う。近似しない。
- 迷ったら自問: **「これは本当にその物に見えるか?」** 見えないなら自作SVGを描く。

## その他の確立済み規約

- **絵文字をUIに使わない**。アイコンは lucide / simple-icons / 自作SVG のいずれか。
- データ変更で**経済やアイテム集合が変わったら** `client/src/game/store.ts` の `SAVE_VERSION` を上げる。
- 変更後は必ず通す:
  - `cd client && npx tsc --noEmit`
  - `npx tsx src/game/offline.test.ts`（`ALL PASS` 必須）
  - `npx vite build`
- コミット前に整形＆Lintを通す（ルートで）:
  - `npm run format`（oxfmt・既定で書込）
  - `npm run lint`（oxlint・警告ゼロを維持）
  - `npm run knip`（不要なexport/依存/ファイルの検出。型のみのexportは許容）
- 設計判断・仕様変更は `docs/SPEC.md` に記録する。
- スキル知識の4軸（言語 / 領域・プラットフォーム / インフラ・基盤 / 業界ドメイン）と
  「知的活動が生むのは commit のみ・アイテムを生むのは物理制作のみ」の原則を崩さない（詳細は SPEC §0-11b〜e）。

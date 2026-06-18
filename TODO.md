# リファクタリング TODO

目的: 定数化・共通化・ファイル切り出しで可読性と保守性を上げる。各フェーズ後に
`tsc --noEmit` / offline テスト / `vite build` を通す。最後に整形・Lint・knip。

## Phase 1 — 定数化（constants.ts）
- [x] `client/src/game/constants.ts` を新規作成し、散在する数値を集約
  - エンジン: `TICK_MS` `SAVE_VERSION` `SAVE_EVERY_MS` `MAX_OFFLINE_MS` `LOG_LIMIT`
  - 通知: `TOAST_MS` `XP_FLASH_MS`
  - 経済/初期値: `SHOP_MARKUP=2` `STARTING_GOLD=25` `STARTING_BANK` `HP_PER_MENTAL_LEVEL=10`
  - オンボーディング: `ONBOARD_MAIN_LEVEL=5` `ONBOARD_INTEREST_LEVEL=2`
- [x] store.ts から定義を移し、import して使用（`shopPrice` は `SHOP_MARKUP` を使用）

## Phase 2 — 共通化（util / timing）
- [x] `client/src/game/util.ts`: `randInt` `toggleInSet`
- [x] `client/src/game/timing.ts`: `actionTiming(action, eff)`（effTime/xpPer/isCraft）・`plotGrowthRate(state)`
- [x] store.ts と progression.ts の重複（effTime/xpPer・畑成長レート）を timing.ts に集約
- [x] Sidebar / OnboardingModal の Set トグルを `toggleInSet` に

## Phase 3 — ファイル切り出し
- [x] `client/src/game/tick.ts`: `toastLevelUp` `advancePlots` `runSkillTick` `runCombatTick`（+ SetFn/GetFn 型）を store.ts から移動
- [x] `client/src/ui/brandColors.ts`: `BRAND_COLOR` を icons.tsx から分離

## Phase 4 — 整形 / Lint / 未使用削除
- [x] `npx oxfmt --init` で `.oxfmtrc.json` を作成・調整
- [x] `npm run format`（oxfmt）
- [x] `npm run lint`（oxlint）警告ゼロ。未使用変数/未使用importを削除

## Phase 5 — knip で明らかな不要のみ整理
- [x] `npm run knip` 実行。明らかに不要な export/ファイル/依存を削除（型のみの export は API として許容）

## 完了条件
- [x] tsc / offline テスト / build 全て green、oxlint 0 警告、format 済み

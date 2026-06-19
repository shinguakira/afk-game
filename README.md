# Idle Engineer

無名のコーダーが技術を極め、金を稼ぎ、起業して伝説になる **放置 / インクリメンタル RPG**。
**Vite + React + TypeScript**。セーブは小さな **Express + TS** サーバが JSON ファイルに書く（DB なし。Web / デスクトップでは localStorage で動く）。

## コアループ

一度に1つのアクションを選ぶ → タイマーで自動反復し、XP とアイテムを得る。

- **学習 (skill)**: 言語/領域/インフラ/ドメインを上げて commit を産む
- **制作 (craft)**: PC組立・電子工作・料理・農業 — 素材から物理アイテムを作る
- **戦闘 (combat)**: 自動バトル。メンタル(HP)・食事・装備デバイスを使う
- **ショップ / ストレージ**: 戦利品を売って給料(¥)、食事や種を買う
- **キャリア / 起業**: 総合熟練度で昇進 → 職種クラス → 起業(prestige)で永続強化
- **オフライン進行**: 閉じている間も経過時間ぶん（最大24h）アクションの成果が貯まる

> 原則: **知的活動が産むのは commit のみ・物理アイテムを産むのは制作のみ**（詳細 `docs/SPEC.md`）。

## フォルダ構成

```
afk-game/
├─ client/                Vite + React + TS（ゲーム本体）
│  └─ src/
│     ├─ app/             エントリ・App シェル・グローバル CSS（Tailwind v4）
│     ├─ components/      画面/UI（*View.tsx）・アイコン（icons / itemIcons）
│     ├─ store/           Zustand ストア（状態 + アクション）
│     ├─ lib/             ロジック（tick, combat, xp, offline, migrate, persistence…）
│     ├─ constants/       データ駆動の定義（items, skills, actions, monsters, farming…）
│     └─ types/           ドメイン別の型（items, skills, save, effects…）
│  └─ test/               vitest
├─ server/                Express + TS セーブサーバ → server/data/*.json
├─ src-tauri/             デスクトップ版ラッパー（Tauri v2）
└─ docs/SPEC.md           仕様・設計判断の記録
```

- 規約（アイコン・型・バレル禁止 等）は **`AGENTS.md`**。
- Web(Vercel) / デスクトップ(Tauri) の両立は **`DESKTOP.md`**。

## 動かす

```bash
npm install     # client + server をまとめて（npm workspaces）
npm run dev     # セーブサーバ(:3001) と client(:5173) を同時起動
```

http://localhost:5173 を開く。client は `/api/*` をサーバへプロキシする。

```bash
npm run build   # client を client/dist へ
npm start       # セーブサーバ単体
```

## コンテンツ追加

ゲーム内容はデータ駆動。スキル/アイテム/モンスター等は `client/src/constants/` の型付き定義を編集する（通常はエンジン変更不要）。
経済やセーブ構造が変わる変更では `client/src/constants/config.ts` の `SAVE_VERSION` を上げる。

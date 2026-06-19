# デスクトップ版 (Tauri) と Web (Vercel) の両立

このリポジトリは **1つのフロントエンド (`client/`)** を、Web と デスクトップの両方に出せる。

## 保存(セーブ)の置き場所
`client/src/lib/persistence.ts` が環境を自動判定する:

| 実行環境 | セーブ先 |
|---|---|
| ローカル開発 (`npm run dev`) | Express セーブサーバ `server/data/*.json`（＋localStorage 複製） |
| **Vercel(静的)** | **localStorage**（サーバ不要） |
| **Tauri(デスクトップ)** | **localStorage**（webview 内・サーバ不要） |

→ Web/デスクトップではバックエンド無しで動く。Express サーバは**ローカル開発の便利機能**であって必須ではない。

## Web (Vercel) — そのままデプロイ
ルートの `vercel.json` が `client` を静的ビルドする:
- Build: `npm run build` → 出力 `client/dist`
- SPA リライト（全パス → `index.html`）

リポジトリを Vercel に import するだけ（ダッシュボードの追加設定不要）。`src-tauri/` は Vercel のビルドに影響しない。

## デスクトップ (Tauri v2)
**前提**: Rust ツールチェイン（`rustup`）と各OSの WebView 依存。初回のみ `npm install`（`@tauri-apps/cli` が入る）。

```bash
npm run desktop        # 開発（client dev を起動して native window に表示）
npm run desktop:build  # 配布用バイナリ/インストーラをビルド
```

- `src-tauri/tauri.conf.json`: `frontendDist=../client/dist`, `devUrl=http://localhost:5180`。
- 薄いラッパー（`src-tauri/src/main.rs`）。ゲームロジックは全てフロント側。
- 外部リンク（各技術の「公式」リンク等）は `client/src/lib/desktop.ts` がシステムブラウザで開く（Web では no-op）。

### アイコン
`src-tauri/icons/` に暫定PNGを同梱。本番用の全プラットフォーム分（.ico/.icns 含む）は
任意の元画像から再生成できる:
```bash
npm run tauri icon path/to/app-icon.png
```

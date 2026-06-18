// デスクトップ(Tauri)実行時のみ: 外部リンク(http/https)をシステムブラウザで開く。
// webview をゲームから外部サイトへ遷移させない。Webブラウザでは window.__TAURI__ が
// 無いので完全な no-op（バンドル/挙動に影響なし）。tauri.conf の withGlobalTauri:true 前提。
type TauriGlobal = {
  core?: { invoke?: (cmd: string, args?: unknown) => Promise<unknown> };
};

export function initDesktopLinks(): void {
  const tauri = (window as unknown as { __TAURI__?: TauriGlobal }).__TAURI__;
  const invoke = tauri?.core?.invoke;
  if (!invoke) return; // 通常のWeb（Vercel等）

  document.addEventListener("click", (e) => {
    const el = e.target as HTMLElement | null;
    const a = el?.closest?.("a") as HTMLAnchorElement | null;
    const href = a?.getAttribute("href") ?? "";
    if (!/^https?:\/\//i.test(href)) return;
    e.preventDefault();
    void invoke("plugin:opener|open_url", { url: href }).catch(() => {
      /* リンクを開けなくてもアプリは壊さない */
    });
  });
}

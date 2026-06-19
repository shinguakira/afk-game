import type { SaveState } from "@/types/save";

const SLOT = "default";
const BASE = `/api/save/${SLOT}`;
const LS_KEY = `afk-save-${SLOT}`;

// セーブの置き場所:
//  - ローカル開発: Express セーブサーバ(/api/save) にファイル保存（＋localStorageにも複製）。
//  - Vercel(静的) / Tauri(デスクトップ): サーバが無いので localStorage が保存先。
// 初回 load でサーバ到達性を判定し、以降はそれに従う（不明なら両方試す）。
let serverOk: boolean | null = null;

function lsLoad(): SaveState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SaveState) : null;
  } catch {
    return null;
  }
}

function lsSave(state: SaveState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* quota/private mode: best effort */
  }
}

/** Load the save. Prefers the server in dev; otherwise localStorage. null = no save yet. */
export async function loadSave(): Promise<SaveState | null> {
  try {
    const res = await fetch(BASE);
    if (res.status === 404) {
      serverOk = true; // サーバはいるがファイル無し → 新規
      return null;
    }
    if (!res.ok) throw new Error(`load failed: ${res.status}`);
    serverOk = true;
    return (await res.json()) as SaveState;
  } catch {
    // サーバ不在(Vercel/Tauri) → localStorage から
    serverOk = false;
    return lsLoad();
  }
}

export async function writeSave(state: SaveState): Promise<boolean> {
  lsSave(state); // 常にローカルにも保存（Vercel/Tauri ではこれが本体）
  if (serverOk === false) return true;
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!res.ok && serverOk === null) serverOk = false;
    return true;
  } catch {
    serverOk = false;
    return true;
  }
}

/** Fire-and-forget save for page unload (uses sendBeacon when available). */
export function flushSaveOnUnload(state: SaveState): void {
  lsSave(state);
  try {
    if (serverOk !== false && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
      navigator.sendBeacon(BASE, blob);
    }
  } catch {
    /* best effort */
  }
}

export async function deleteSave(): Promise<void> {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
  try {
    await fetch(BASE, { method: "DELETE" });
  } catch {
    /* ignore */
  }
}

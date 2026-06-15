import type { SaveState } from "./types";

const SLOT = "default";
const BASE = `/api/save/${SLOT}`;

/** Load the save from the server. Returns null when no save exists yet. */
export async function loadSave(): Promise<SaveState | null> {
  try {
    const res = await fetch(BASE);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`load failed: ${res.status}`);
    return (await res.json()) as SaveState;
  } catch (err) {
    console.warn("[persistence] load failed, starting fresh:", err);
    return null;
  }
}

export async function writeSave(state: SaveState): Promise<boolean> {
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch (err) {
    console.warn("[persistence] save failed:", err);
    return false;
  }
}

/** Fire-and-forget save for page unload (uses sendBeacon when available). */
export function flushSaveOnUnload(state: SaveState): void {
  try {
    const blob = new Blob([JSON.stringify(state)], {
      type: "application/json",
    });
    if (navigator.sendBeacon) navigator.sendBeacon(BASE, blob);
  } catch {
    /* best effort */
  }
}

export async function deleteSave(): Promise<void> {
  try {
    await fetch(BASE, { method: "DELETE" });
  } catch {
    /* ignore */
  }
}

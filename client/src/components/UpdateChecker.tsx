import { useEffect, useState } from "react";

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function UpdateChecker() {
  const [available, setAvailable] = useState<{ version: string; download: () => Promise<void> } | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!isTauri) return;
    const timer = setTimeout(async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();
        if (update?.available) {
          setAvailable({
            version: update.version,
            download: async () => {
              await update.downloadAndInstall();
              const { restart } = await import("@tauri-apps/plugin-process");
              await restart();
            },
          });
        }
      } catch {
        // エンドポイント未設定・ネットワーク不達の場合は無視
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!available) return null;

  return (
    <button
      className="border-accent2 text-[12px] text-accent2"
      disabled={installing}
      onClick={() => {
        setInstalling(true);
        void available.download().catch(() => setInstalling(false));
      }}
    >
      {installing ? "更新中…" : `v${available.version} に更新`}
    </button>
  );
}

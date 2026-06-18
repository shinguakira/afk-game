import { useGame } from "../store";
import { SKILL_MAP } from "../constants/maps";
import { Icon } from "./icons";

// 画面下中央: XP獲得インジケータ（Melvor風）＋ レベルアップ/目標達成トースト。
export function ToastHost() {
  const toasts = useGame((s) => s.toasts);
  const xpFlash = useGame((s) => s.xpFlash);

  const flashName =
    xpFlash &&
    (xpFlash.skillId === "combat"
      ? "現場力"
      : (SKILL_MAP[xpFlash.skillId]?.name ?? xpFlash.skillId));
  const flashIcon =
    xpFlash && (xpFlash.skillId === "combat" ? "impl" : SKILL_MAP[xpFlash.skillId]?.icon);

  return (
    <div className="pointer-events-none fixed bottom-[18px] left-1/2 z-[100] flex -translate-x-1/2 flex-col-reverse items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex animate-toast-in items-center gap-2 rounded-lg border border-l-[3px] border-border bg-panel2 px-3.5 py-2 text-[13px] font-semibold shadow-[0_6px_20px_rgba(0,0,0,0.45)] ${
            t.kind === "level"
              ? "border-l-xp"
              : t.kind === "goal"
                ? "border-l-accent2"
                : "border-l-accent"
          }`}
        >
          <Icon name={t.icon} size={16} />
          <span>{t.text}</span>
        </div>
      ))}
      {xpFlash && (
        <div
          className="flex animate-xp-pulse items-center gap-1.5 rounded-[20px] border border-border bg-panel px-3 py-1 text-xs text-muted shadow-[0_3px_12px_rgba(0,0,0,0.4)]"
          key={xpFlash.amount}
        >
          <Icon name={flashIcon ?? undefined} size={14} />
          <span>{flashName}</span>
          <strong className="text-xp">+{xpFlash.amount} xp</strong>
        </div>
      )}
    </div>
  );
}

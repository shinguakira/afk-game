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
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind ?? ""}`}>
          <Icon name={t.icon} size={16} />
          <span>{t.text}</span>
        </div>
      ))}
      {xpFlash && (
        <div className="xp-flash" key={xpFlash.amount}>
          <Icon name={flashIcon ?? undefined} size={14} />
          <span>{flashName}</span>
          <strong>+{xpFlash.amount} xp</strong>
        </div>
      )}
    </div>
  );
}

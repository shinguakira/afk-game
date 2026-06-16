import { useGame } from "../game/store";
import { Icon } from "../ui/icons";

// 画面下中央に出る Melvor 風スナックバー（レベルアップ/目標達成など）。
export function ToastHost() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind ?? ""}`}>
          <Icon name={t.icon} size={16} />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

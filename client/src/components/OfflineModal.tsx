import { useGame } from "../store";
import { ITEM_MAP, SKILL_MAP } from "../constants/maps";
import { formatDuration, formatNumber } from "../lib/format";
import { Icon } from "./icons";

export function OfflineModal() {
  const summary = useGame((s) => s.offlineSummary);
  const dismiss = useGame((s) => s.dismissOffline);
  if (!summary) return null;

  const xpEntries = Object.entries(summary.xp).filter(([, v]) => v > 0);
  const itemEntries = Object.entries(summary.items).filter(([, v]) => v !== 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[min(440px,92vw)] rounded-[14px] border border-border bg-panel p-6">
        <h2>おかえりなさい</h2>
        <p className="text-muted">
          <strong>{formatDuration(summary.ms)}</strong> ぶん業務が進みました。成果:
        </p>

        {summary.gold > 0 && (
          <div className="my-2 flex items-center justify-between">
            <span>給料</span>
            <span className="text-accent2">+¥{formatNumber(summary.gold)}</span>
          </div>
        )}

        {xpEntries.length > 0 && (
          <>
            <h3 className="mb-1">経験値</h3>
            {xpEntries.map(([id, v]) => (
              <div className="flex items-center justify-between" key={id}>
                <span className="flex items-center gap-1.5">
                  <Icon name={SKILL_MAP[id]?.icon} size={14} />
                  {SKILL_MAP[id]?.name ?? id}
                </span>
                <span className="text-accent2">+{formatNumber(v)}</span>
              </div>
            ))}
          </>
        )}

        {itemEntries.length > 0 && (
          <>
            <h3 className="mb-1">獲得アイテム</h3>
            {itemEntries.map(([id, v]) => (
              <div className="flex items-center justify-between" key={id}>
                <span className="flex items-center gap-1.5">
                  <Icon name={ITEM_MAP[id]?.icon} size={14} />
                  {ITEM_MAP[id]?.name ?? id}
                </span>
                <span className={v > 0 ? "text-accent2" : "text-danger"}>
                  {v > 0 ? "+" : ""}
                  {formatNumber(v)}
                </span>
              </div>
            ))}
          </>
        )}

        {xpEntries.length === 0 && itemEntries.length === 0 && summary.gold === 0 && (
          <p className="text-muted">…ほぼ無し。作業が止まっていたようです（素材切れ？）。</p>
        )}

        <button
          className="mt-4 w-full border-accent bg-accent font-semibold text-[#06101f]"
          onClick={dismiss}
        >
          受け取る
        </button>
      </div>
    </div>
  );
}

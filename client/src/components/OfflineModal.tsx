import { useGame } from "../game/store";
import { ITEM_MAP, SKILL_MAP } from "../game/data";
import { formatDuration, formatNumber } from "../ui/format";
import { Icon } from "../ui/icons";

export function OfflineModal() {
  const summary = useGame((s) => s.offlineSummary);
  const dismiss = useGame((s) => s.dismissOffline);
  if (!summary) return null;

  const xpEntries = Object.entries(summary.xp).filter(([, v]) => v > 0);
  const itemEntries = Object.entries(summary.items).filter(([, v]) => v !== 0);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>おかえりなさい</h2>
        <p className="muted">
          <strong>{formatDuration(summary.ms)}</strong> ぶん業務が進みました。成果:
        </p>

        {summary.gold > 0 && (
          <div className="row-between" style={{ margin: "8px 0" }}>
            <span>給料</span>
            <span className="gain">+¥{formatNumber(summary.gold)}</span>
          </div>
        )}

        {xpEntries.length > 0 && (
          <>
            <h3 style={{ marginBottom: 4 }}>経験値</h3>
            {xpEntries.map(([id, v]) => (
              <div className="row-between" key={id}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name={SKILL_MAP[id]?.icon} size={14} />
                  {SKILL_MAP[id]?.name ?? id}
                </span>
                <span className="gain">+{formatNumber(v)}</span>
              </div>
            ))}
          </>
        )}

        {itemEntries.length > 0 && (
          <>
            <h3 style={{ marginBottom: 4 }}>成果物</h3>
            {itemEntries.map(([id, v]) => (
              <div className="row-between" key={id}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name={ITEM_MAP[id]?.icon} size={14} />
                  {ITEM_MAP[id]?.name ?? id}
                </span>
                <span className={v > 0 ? "gain" : "loss"}>
                  {v > 0 ? "+" : ""}
                  {formatNumber(v)}
                </span>
              </div>
            ))}
          </>
        )}

        {xpEntries.length === 0 &&
          itemEntries.length === 0 &&
          summary.gold === 0 && (
            <p className="muted">…ほぼ無し。作業が止まっていたようです（素材切れ？）。</p>
          )}

        <button
          className="primary"
          style={{ width: "100%", marginTop: 16 }}
          onClick={dismiss}
        >
          受け取る
        </button>
      </div>
    </div>
  );
}

import { useGame } from "../game/store";
import { ITEM_MAP, SKILL_MAP } from "../game/data";
import { formatDuration, formatNumber } from "../ui/format";

export function OfflineModal() {
  const summary = useGame((s) => s.offlineSummary);
  const dismiss = useGame((s) => s.dismissOffline);
  if (!summary) return null;

  const xpEntries = Object.entries(summary.xp).filter(([, v]) => v > 0);
  const itemEntries = Object.entries(summary.items).filter(([, v]) => v !== 0);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Welcome back!</h2>
        <p className="muted">
          You were away for <strong>{formatDuration(summary.ms)}</strong>. While
          idle you earned:
        </p>

        {summary.gold > 0 && (
          <div className="row-between" style={{ margin: "8px 0" }}>
            <span>Gold</span>
            <span className="gain">+{formatNumber(summary.gold)}g</span>
          </div>
        )}

        {xpEntries.length > 0 && (
          <>
            <h3 style={{ marginBottom: 4 }}>XP</h3>
            {xpEntries.map(([id, v]) => (
              <div className="row-between" key={id}>
                <span>{SKILL_MAP[id]?.name ?? id}</span>
                <span className="gain">+{formatNumber(v)}</span>
              </div>
            ))}
          </>
        )}

        {itemEntries.length > 0 && (
          <>
            <h3 style={{ marginBottom: 4 }}>Items</h3>
            {itemEntries.map(([id, v]) => (
              <div className="row-between" key={id}>
                <span>{ITEM_MAP[id]?.name ?? id}</span>
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
            <p className="muted">…not much. Your action stalled (out of materials?).</p>
          )}

        <button
          className="primary"
          style={{ width: "100%", marginTop: 16 }}
          onClick={dismiss}
        >
          Collect
        </button>
      </div>
    </div>
  );
}

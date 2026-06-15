import { useGame } from "../game/store";
import { COMBAT_STAT_IDS, CLASS_MAP } from "../game/data";
import { levelForXp } from "../game/xp";
import { currentRank } from "../game/rank";

export function LogPanel() {
  const log = useGame((s) => s.log);
  const skills = useGame((s) => s.skills);
  const bank = useGame((s) => s.bank);
  const jobClass = useGame((s) => s.jobClass);

  // Engineer level = avg of the four combat stats.
  const combatLevel = Math.floor(
    COMBAT_STAT_IDS.reduce(
      (sum, id) => sum + levelForXp(skills[id]?.xp ?? 0),
      0,
    ) / COMBAT_STAT_IDS.length,
  );
  const bankCount = Object.values(bank).filter((q) => q > 0).length;
  const rank = currentRank(useGame.getState());
  const className = CLASS_MAP[jobClass ?? "none"]?.name ?? "無所属";
  const stock = useGame((s) => s.prestigePoints);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>概要</h3>
      <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
        <div className="row-between">
          <span>役職</span>
          <strong style={{ color: "var(--text)" }}>{rank.name}</strong>
        </div>
        <div className="row-between">
          <span>職種</span>
          <strong style={{ color: "var(--text)" }}>{className}</strong>
        </div>
        <div className="row-between">
          <span>エンジニアレベル</span>
          <strong style={{ color: "var(--text)" }}>{combatLevel}</strong>
        </div>
        <div className="row-between">
          <span>成果物の種類</span>
          <strong style={{ color: "var(--text)" }}>{bankCount}</strong>
        </div>
        {stock > 0 && (
          <div className="row-between">
            <span>ストック</span>
            <strong style={{ color: "var(--gold)" }}>{stock}</strong>
          </div>
        )}
      </div>

      <h3>ログ</h3>
      <div className="log">
        {log.length === 0 && <div className="muted">まだありません…</div>}
        {log.map((entry, i) => (
          <div className="entry" key={i}>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useGame } from "../game/store";
import { COMBAT_STAT_IDS } from "../game/data";
import { levelForXp } from "../game/xp";

export function LogPanel() {
  const log = useGame((s) => s.log);
  const skills = useGame((s) => s.skills);
  const bank = useGame((s) => s.bank);

  // Engineer level = avg of the four combat stats.
  const combatLevel = Math.floor(
    COMBAT_STAT_IDS.reduce(
      (sum, id) => sum + levelForXp(skills[id]?.xp ?? 0),
      0,
    ) / COMBAT_STAT_IDS.length,
  );
  const bankCount = Object.values(bank).filter((q) => q > 0).length;

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>概要</h3>
      <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
        <div className="row-between">
          <span>エンジニアレベル</span>
          <strong style={{ color: "var(--text)" }}>{combatLevel}</strong>
        </div>
        <div className="row-between">
          <span>成果物の種類</span>
          <strong style={{ color: "var(--text)" }}>{bankCount}</strong>
        </div>
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

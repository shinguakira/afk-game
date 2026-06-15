import { useGame } from "../game/store";
import { levelForXp } from "../game/xp";

export function LogPanel() {
  const log = useGame((s) => s.log);
  const skills = useGame((s) => s.skills);
  const bank = useGame((s) => s.bank);

  // A few "headline" stats in the side panel.
  const combatLevel = Math.floor(
    (levelForXp(skills.attack?.xp ?? 0) +
      levelForXp(skills.strength?.xp ?? 0) +
      levelForXp(skills.defence?.xp ?? 0) +
      levelForXp(skills.hitpoints?.xp ?? 0)) /
      4,
  );
  const bankCount = Object.values(bank).filter((q) => q > 0).length;

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Overview</h3>
      <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
        <div className="row-between">
          <span>Combat level</span>
          <strong style={{ color: "var(--text)" }}>{combatLevel}</strong>
        </div>
        <div className="row-between">
          <span>Item types banked</span>
          <strong style={{ color: "var(--text)" }}>{bankCount}</strong>
        </div>
      </div>

      <h3>Activity Log</h3>
      <div className="log">
        {log.length === 0 && <div className="muted">Nothing yet…</div>}
        {log.map((entry, i) => (
          <div className="entry" key={i}>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}

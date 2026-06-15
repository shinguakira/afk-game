import { useGame } from "../game/store";
import { getCombatStats } from "../game/combat";
import { ACTION_MAP, MONSTER_MAP } from "../game/data";
import { formatNumber } from "../ui/format";
import { Bar } from "./Bar";

export function TopBar() {
  const state = useGame();
  const stats = getCombatStats(state);

  let activeLabel = "Idle";
  if (state.active?.kind === "skill") {
    activeLabel = ACTION_MAP[state.active.actionId]?.name ?? "Working";
  } else if (state.active?.kind === "combat") {
    activeLabel = `Fighting ${MONSTER_MAP[state.active.monsterId]?.name ?? ""}`;
  }

  return (
    <div className="topbar">
      <span className="title">⚔️ AFK Idle</span>

      <div className="stat">
        <span>💰</span>
        <span className="gold">{formatNumber(state.gold)}</span>
      </div>

      <div className="stat" style={{ minWidth: 160 }}>
        <span>❤️</span>
        <Bar
          kind="hp"
          value={state.playerHp / stats.maxHp}
          right={`${Math.ceil(state.playerHp)}/${stats.maxHp}`}
        />
      </div>

      <div className="stat">
        <span className="muted">Doing:</span>
        <strong>{activeLabel}</strong>
      </div>

      <div className="spacer" />

      {state.active && (
        <button className="danger" onClick={() => state.stop()}>
          ⏹ Stop
        </button>
      )}
      <button onClick={() => void state.saveNow()}>💾 Save</button>
      <button
        className="danger"
        onClick={() => {
          if (confirm("Wipe all progress and start over?")) void state.hardReset();
        }}
      >
        Reset
      </button>
    </div>
  );
}

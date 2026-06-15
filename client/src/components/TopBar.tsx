import { useGame } from "../game/store";
import { getCombatStats } from "../game/combat";
import { ACTION_MAP, MONSTER_MAP } from "../game/data";
import { formatNumber } from "../ui/format";
import { Bar } from "./Bar";

export function TopBar() {
  const state = useGame();
  const stats = getCombatStats(state);

  let activeLabel = "待機中";
  if (state.active?.kind === "skill") {
    activeLabel = ACTION_MAP[state.active.actionId]?.name ?? "作業中";
  } else if (state.active?.kind === "combat") {
    activeLabel = `案件対応: ${MONSTER_MAP[state.active.monsterId]?.name ?? ""}`;
  }

  return (
    <div className="topbar">
      <span className="title">💻 Idle Engineer</span>

      <div className="stat">
        <span>¥</span>
        <span className="gold">{formatNumber(state.gold)}</span>
      </div>

      <div className="stat" style={{ minWidth: 160 }}>
        <span title="メンタル">🧠</span>
        <Bar
          kind="hp"
          value={state.playerHp / stats.maxHp}
          right={`${Math.ceil(state.playerHp)}/${stats.maxHp}`}
        />
      </div>

      <div className="stat">
        <span className="muted">業務:</span>
        <strong>{activeLabel}</strong>
      </div>

      <div className="spacer" />

      {state.active && (
        <button className="danger" onClick={() => state.stop()}>
          ⏹ 中断
        </button>
      )}
      <button onClick={() => void state.saveNow()}>💾 保存</button>
      <button
        className="danger"
        onClick={() => {
          if (confirm("全進捗を消して退職（最初から）しますか？")) void state.hardReset();
        }}
      >
        退職
      </button>
    </div>
  );
}

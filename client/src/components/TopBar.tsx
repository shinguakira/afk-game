import { useGame } from "../game/store";
import { getCombatStats } from "../game/combat";
import { ACTION_MAP, MONSTER_MAP } from "../game/data";
import { currentRank } from "../game/rank";
import { formatNumber } from "../ui/format";
import { Bar } from "./Bar";
import { Icon } from "../ui/icons";

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
      <span className="title">
        <Icon name="company" size={18} /> Idle Engineer
      </span>
      <span style={{ fontSize: 13 }}>
        {state.playerName && <strong>{state.playerName}</strong>}
        <span className="muted"> ・ {currentRank(state).name}</span>
      </span>

      <div className="stat">
        <span className="gold" style={{ fontWeight: 700 }}>
          ¥
        </span>
        <span className="gold">{formatNumber(state.gold)}</span>
      </div>

      <div className="stat" style={{ minWidth: 160 }}>
        <Icon name="mental" title="メンタル" />
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
          <Icon name="stop" size={14} /> 中断
        </button>
      )}
      <button onClick={() => state.restartTutorial()} title="チュートリアルをもう一度">
        <Icon name="roadmap" size={14} /> 使い方
      </button>
      <button onClick={() => void state.saveNow()}>
        <Icon name="save" size={14} /> 保存
      </button>
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

import { useGame } from "@/store";
import { getCombatStats } from "@/lib/combat";
import { ACTION_MAP, MONSTER_MAP } from "@/constants/maps";
import { currentRank } from "@/lib/rank";
import { formatNumber } from "@/lib/format";
import { Bar } from "@/components/Bar";
import { Icon } from "@/components/icons";

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
    <div className="flex flex-wrap items-center gap-[18px] border-b border-border bg-panel px-4 py-2.5">
      <span className="text-base font-bold tracking-[0.5px]">
        <Icon name="company" size={18} /> Idle Engineer
      </span>
      <span className="text-[13px]">
        {state.playerName && <strong>{state.playerName}</strong>}
        <span className="text-muted"> ・ {currentRank(state).name}</span>
      </span>

      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-bold text-gold">¥</span>
        <span className="font-semibold text-gold">{formatNumber(state.gold)}</span>
      </div>

      <div className="flex min-w-[160px] items-center gap-1.5 text-sm">
        <Icon name="mental" title="メンタル" />
        <Bar
          kind="hp"
          value={state.playerHp / stats.maxHp}
          right={`${Math.ceil(state.playerHp)}/${stats.maxHp}`}
        />
      </div>

      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted">業務:</span>
        <strong>{activeLabel}</strong>
      </div>

      <div className="flex-1" />

      {state.active && (
        <button className="border-danger text-danger" onClick={() => state.stop()}>
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
        className="border-danger text-danger"
        onClick={() => {
          if (confirm("全進捗を消して退職（最初から）しますか？")) void state.hardReset();
        }}
      >
        退職
      </button>
    </div>
  );
}

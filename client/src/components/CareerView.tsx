import { useGame } from "@/store";
import { CLASSES } from "@/constants/classes";
import { currentRank, nextRank, totalLevel, RANKS } from "@/lib/rank";
import { EFFECT_LABEL } from "@/lib/modifiers";
import { Bar } from "@/components/Bar";
import { Icon } from "@/components/icons";

export function CareerView() {
  const state = useGame();
  const rank = currentRank(state);
  const next = nextRank(state);
  const total = totalLevel(state);

  const progress = next ? (total - rank.total) / (next.total - rank.total) : 1;

  return (
    <div>
      <h2 className="mb-1 flex items-center gap-2 text-lg">
        <Icon name="career" size={22} /> キャリア
      </h2>
      <p className="mb-4 text-[13px] text-muted">
        総合熟練度で昇進。ミドル(rank3)で職種を選べ、テックリードで上位職へ。
      </p>

      {/* Rank progress */}
      <div className="mb-4 max-w-[460px] rounded-[10px] border border-border bg-panel2 p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <strong className="text-base">
            {rank.name}
            <span className="font-normal text-muted"> （総合 {total}）</span>
          </strong>
          {next && <span className="text-muted">次: {next.name}</span>}
        </div>
        <Bar kind="xp" value={progress} right={next ? `${total} / ${next.total}` : "最高位"} />
        <div className="mt-2 text-[11px] text-muted">
          昇進ライン: {RANKS.map((r) => r.name).join(" → ")}
        </div>
      </div>

      {/* Class selection */}
      <h3 className="mb-2.5">職種クラス</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {CLASSES.map((c) => {
          const unlocked = rank.index >= c.requiresRank;
          const isCurrent = (state.jobClass ?? "none") === c.id;
          return (
            <div
              key={c.id}
              className={`rounded-[10px] border bg-panel2 p-3 ${!unlocked ? "opacity-50" : ""} ${isCurrent ? "border-accent2" : "border-border"}`}
            >
              <h3>
                <Icon name={c.icon} size={18} /> {c.name}
              </h3>
              {c.upgradesFrom && (
                <div className="mb-2 text-xs text-muted">
                  上位職 · 要 {RANKS[c.requiresRank].name}
                </div>
              )}
              <div className="mb-2 min-h-[44px] text-xs">
                {c.modifiers.length === 0 && <span className="text-muted">補正なし</span>}
                {c.modifiers.map((m, i) => (
                  <span
                    className={`mr-1 my-0.5 inline-block rounded-md border border-border bg-panel px-1.5 py-px text-[11px] ${m.pct >= 0 ? "text-accent2" : "text-danger"}`}
                    key={i}
                  >
                    {EFFECT_LABEL[m.key]} {m.pct >= 0 ? "+" : ""}
                    {m.pct}%
                  </span>
                ))}
              </div>
              {c.passive && <div className="mb-2 text-[11px] text-muted">{c.passive}</div>}
              <button
                className={
                  isCurrent
                    ? "w-full"
                    : "w-full border-accent bg-accent font-semibold text-[#06101f]"
                }
                disabled={!unlocked || isCurrent}
                onClick={() => state.setClass(c.id)}
              >
                {isCurrent
                  ? "選択中"
                  : !unlocked
                    ? `要 ${RANKS[c.requiresRank].name}`
                    : "この職種にする"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

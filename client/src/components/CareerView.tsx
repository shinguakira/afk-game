import { useGame } from "../game/store";
import { CLASSES } from "../game/data";
import { currentRank, nextRank, totalLevel, RANKS } from "../game/rank";
import { EFFECT_LABEL } from "../game/modifiers";
import { Bar } from "./Bar";
import { Icon } from "../ui/icons";

export function CareerView() {
  const state = useGame();
  const rank = currentRank(state);
  const next = nextRank(state);
  const total = totalLevel(state);

  const progress = next ? (total - rank.total) / (next.total - rank.total) : 1;

  return (
    <div>
      <h2 className="section-title">
        <Icon name="career" size={22} /> キャリア
      </h2>
      <p className="section-sub">
        総合熟練度で昇進。ミドル(rank3)で職種を選べ、テックリードで上位職へ。
      </p>

      {/* Rank progress */}
      <div className="card" style={{ marginBottom: 16, maxWidth: 460 }}>
        <div className="row-between" style={{ marginBottom: 6 }}>
          <strong style={{ fontSize: 16 }}>
            {rank.name}
            <span className="muted" style={{ fontWeight: 400 }}>
              {" "}
              （総合 {total}）
            </span>
          </strong>
          {next && <span className="muted">次: {next.name}</span>}
        </div>
        <Bar kind="xp" value={progress} right={next ? `${total} / ${next.total}` : "最高位"} />
        <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
          昇進ライン: {RANKS.map((r) => r.name).join(" → ")}
        </div>
      </div>

      {/* Class selection */}
      <h3 style={{ margin: "0 0 10px" }}>職種クラス</h3>
      <div className="grid">
        {CLASSES.map((c) => {
          const unlocked = rank.index >= c.requiresRank;
          const isCurrent = (state.jobClass ?? "none") === c.id;
          return (
            <div
              key={c.id}
              className={`card ${!unlocked ? "locked" : ""} ${isCurrent ? "selected" : ""}`}
            >
              <h3>
                <Icon name={c.icon} size={18} /> {c.name}
              </h3>
              {c.upgradesFrom && (
                <div className="meta">上位職 · 要 {RANKS[c.requiresRank].name}</div>
              )}
              <div className="io" style={{ minHeight: 44 }}>
                {c.modifiers.length === 0 && <span className="muted">補正なし</span>}
                {c.modifiers.map((m, i) => (
                  <span
                    className="tag"
                    key={i}
                    style={{ color: m.pct >= 0 ? "var(--accent-2)" : "var(--danger)" }}
                  >
                    {EFFECT_LABEL[m.key]} {m.pct >= 0 ? "+" : ""}
                    {m.pct}%
                  </span>
                ))}
              </div>
              {c.passive && (
                <div className="muted" style={{ fontSize: 11, marginBottom: 8 }}>
                  {c.passive}
                </div>
              )}
              <button
                className={isCurrent ? "" : "primary"}
                style={{ width: "100%" }}
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

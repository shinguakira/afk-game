import { useGame } from "../game/store";
import { MILESTONES, AXIS_META, firstIncomplete } from "../game/roadmap";
import { formatNumber } from "../ui/format";
import { Icon } from "../ui/icons";

export function RoadmapView() {
  const milestones = useGame((s) => s.milestones);
  const state = useGame();
  const done = new Set(milestones);
  const current = firstIncomplete(milestones, state);

  return (
    <div>
      <h2 className="section-title">
        <Icon name="career" size={22} /> ロードマップ
      </h2>
      <p className="section-sub">キャリアの目標を順に達成しよう。常に「次の目標」が示されます。</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 620 }}>
        {MILESTONES.map((m) => {
          const isDone = done.has(m.id);
          const isCurrent = current?.id === m.id;
          const ax = AXIS_META[m.axis];
          return (
            <div
              key={m.id}
              className={`card ${isCurrent ? "selected" : ""}`}
              style={{ opacity: isDone ? 0.55 : isCurrent ? 1 : 0.8, padding: "10px 12px" }}
            >
              <div className="row-between">
                <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name={isDone ? "kudos" : ax.icon} size={16} />
                  {m.title}
                  {isDone && (
                    <span className="muted" style={{ fontSize: 11 }}>
                      達成済み
                    </span>
                  )}
                  {isCurrent && (
                    <span style={{ fontSize: 11, color: "var(--accent-2)" }}>← 今ここ</span>
                  )}
                </strong>
                <span className="tag">{ax.label}</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {m.hint}
                {m.reward?.gold ? ` ・ 報酬 ¥${formatNumber(m.reward.gold)}` : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

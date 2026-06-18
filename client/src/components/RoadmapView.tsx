import { useGame } from "../store";
import { MILESTONES, AXIS_META, firstIncomplete } from "../lib/roadmap";
import { formatNumber } from "../lib/format";
import { Icon } from "./icons";

export function RoadmapView() {
  const milestones = useGame((s) => s.milestones);
  const state = useGame();
  const done = new Set(milestones);
  const current = firstIncomplete(milestones, state);

  return (
    <div>
      <h2 className="mb-1 flex items-center gap-2 text-lg">
        <Icon name="career" size={22} /> ロードマップ
      </h2>
      <p className="mb-4 text-[13px] text-muted">
        キャリアの目標を順に達成しよう。常に「次の目標」が示されます。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 620 }}>
        {MILESTONES.map((m) => {
          const isDone = done.has(m.id);
          const isCurrent = current?.id === m.id;
          const ax = AXIS_META[m.axis];
          return (
            <div
              key={m.id}
              className={`rounded-[10px] border bg-panel2 p-3 ${isCurrent ? "border-accent2" : "border-border"}`}
              style={{ opacity: isDone ? 0.55 : isCurrent ? 1 : 0.8, padding: "10px 12px" }}
            >
              <div className="flex items-center justify-between">
                <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name={isDone ? "kudos" : ax.icon} size={16} />
                  {m.title}
                  {isDone && (
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      達成済み
                    </span>
                  )}
                  {isCurrent && (
                    <span style={{ fontSize: 11, color: "var(--accent-2)" }}>← 今ここ</span>
                  )}
                </strong>
                <span className="mr-1 my-0.5 inline-block rounded-md border border-border bg-panel px-1.5 py-px text-[11px]">
                  {ax.label}
                </span>
              </div>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
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

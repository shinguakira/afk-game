import { useGame } from "@/store";
import { MILESTONES, AXIS_META, firstIncomplete } from "@/lib/roadmap";
import { formatNumber } from "@/lib/format";
import { Icon } from "@/components/icons";

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

      <div className="flex max-w-[620px] flex-col gap-2">
        {MILESTONES.map((m) => {
          const isDone = done.has(m.id);
          const isCurrent = current?.id === m.id;
          const ax = AXIS_META[m.axis];
          return (
            <div
              key={m.id}
              className={`rounded-[10px] border bg-panel2 px-3 py-2.5 ${isCurrent ? "border-accent2" : "border-border"} ${isDone ? "opacity-[0.55]" : isCurrent ? "opacity-100" : "opacity-80"}`}
            >
              <div className="flex items-center justify-between">
                <strong className="flex items-center gap-2">
                  <Icon name={isDone ? "kudos" : ax.icon} size={16} />
                  {m.title}
                  {isDone && <span className="text-[11px] text-muted">達成済み</span>}
                  {isCurrent && <span className="text-[11px] text-accent2">← 今ここ</span>}
                </strong>
                <span className="mr-1 my-0.5 inline-block rounded-md border border-border bg-panel px-1.5 py-px text-[11px]">
                  {ax.label}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted">
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

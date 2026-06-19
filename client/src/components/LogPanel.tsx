import { useGame } from "@/store";
import { CLASS_MAP } from "@/constants/maps";
import { COMBAT_STAT_IDS } from "@/constants/skills";
import { levelForXp } from "@/lib/xp";
import { currentRank } from "@/lib/rank";
import { firstIncomplete, AXIS_META } from "@/lib/roadmap";
import { Icon } from "@/components/icons";

export function LogPanel() {
  const log = useGame((s) => s.log);
  const skills = useGame((s) => s.skills);
  const bank = useGame((s) => s.bank);
  const jobClass = useGame((s) => s.jobClass);
  const milestones = useGame((s) => s.milestones);
  const goal = firstIncomplete(milestones, useGame.getState());

  // Engineer level = avg of the four combat stats.
  const combatLevel = Math.floor(
    COMBAT_STAT_IDS.reduce((sum, id) => sum + levelForXp(skills[id]?.xp ?? 0), 0) /
      COMBAT_STAT_IDS.length,
  );
  const bankCount = Object.values(bank).filter((q) => q > 0).length;
  const rank = currentRank(useGame.getState());
  const className = CLASS_MAP[jobClass ?? "none"]?.name ?? "無所属";
  const stock = useGame((s) => s.prestigePoints);

  return (
    <div>
      <h3 className="mt-0 mb-2 text-[15px] font-bold">次の目標</h3>
      {goal ? (
        <div className="mb-3.5 rounded-[10px] border border-border bg-panel2 px-3 py-2.5">
          <strong className="flex items-center gap-1.5">
            <Icon name={AXIS_META[goal.axis].icon} size={15} />
            {goal.title}
          </strong>
          <div className="mt-1 text-xs text-muted">{goal.hint}</div>
        </div>
      ) : (
        <div className="mb-3.5 text-[13px] text-muted">全目標を達成しました。</div>
      )}

      <h3 className="mt-0 mb-2 text-[15px] font-bold">概要</h3>
      <div className="mb-3 text-[13px] text-muted">
        <div className="flex items-center justify-between">
          <span>役職</span>
          <strong className="text-text">{rank.name}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>職種</span>
          <strong className="text-text">{className}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>エンジニアレベル</span>
          <strong className="text-text">{combatLevel}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>アイテム種類</span>
          <strong className="text-text">{bankCount}</strong>
        </div>
        {stock > 0 && (
          <div className="flex items-center justify-between">
            <span>ストック</span>
            <strong className="text-gold">{stock}</strong>
          </div>
        )}
      </div>

      <h3 className="mb-2 text-[15px] font-bold">ログ</h3>
      <div className="text-xs leading-relaxed">
        {log.length === 0 && <div className="text-muted">まだありません…</div>}
        {log.map((entry, i) => (
          <div className="border-b border-border py-[3px] text-muted" key={i}>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}

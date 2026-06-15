import { useGame } from "../game/store";
import { ACTIONS_BY_SKILL, ITEM_MAP, SKILL_MAP } from "../game/data";
import { levelForXp, levelProgress, MAX_LEVEL, xpForLevel } from "../game/xp";
import { formatNumber } from "../ui/format";
import { Bar } from "./Bar";
import { TimerBar } from "./TimerBar";

function ioTags(io: Partial<Record<string, number>> | undefined) {
  if (!io) return null;
  return Object.entries(io).map(([id, q]) => (
    <span className="tag" key={id}>
      {q}× {ITEM_MAP[id]?.name ?? id}
    </span>
  ));
}

export function SkillView({ skillId }: { skillId: string }) {
  const state = useGame();
  const skill = SKILL_MAP[skillId];
  const actions = ACTIONS_BY_SKILL[skillId] ?? [];
  const xp = state.skills[skillId]?.xp ?? 0;
  const level = levelForXp(xp);

  return (
    <div>
      <h2 className="section-title">
        {skill.icon} {skill.name}
      </h2>
      <div style={{ maxWidth: 420, marginBottom: 18 }}>
        <Bar
          kind="xp"
          value={levelProgress(xp)}
          label={`Level ${level}`}
          right={
            level >= MAX_LEVEL
              ? `${formatNumber(xp)} xp (max)`
              : `${formatNumber(xp)} / ${formatNumber(xpForLevel(level + 1))} xp`
          }
        />
      </div>

      <div className="grid">
        {actions.map((a) => {
          const unlocked = level >= a.level;
          const isActive =
            state.active?.kind === "skill" && state.active.actionId === a.id;
          // can we afford one craft cycle?
          const canCraft =
            !a.inputs ||
            Object.entries(a.inputs).every(
              ([id, q]) => (state.bank[id] ?? 0) >= (q as number),
            );

          return (
            <div
              key={a.id}
              className={`card ${!unlocked ? "locked" : ""} ${
                isActive ? "selected" : ""
              }`}
            >
              <h3>{a.name}</h3>
              <div className="meta">
                Lv {a.level} · {(a.time / 1000).toFixed(1)}s · {a.xp} xp
              </div>
              <div className="io">
                {a.inputs && (
                  <div>
                    <span className="muted">消費: </span>
                    {ioTags(a.inputs)}
                  </div>
                )}
                <div>
                  <span className="muted">産出: </span>
                  {ioTags(a.outputs)}
                </div>
              </div>

              {isActive ? (
                <>
                  <TimerBar periodMs={a.time} running />
                  <button
                    style={{ marginTop: 8, width: "100%" }}
                    className="danger"
                    onClick={() => state.stop()}
                  >
                    中断
                  </button>
                </>
              ) : (
                <button
                  className="primary"
                  style={{ width: "100%" }}
                  disabled={!unlocked || !canCraft}
                  onClick={() => state.startAction(a.id)}
                >
                  {!unlocked
                    ? `Lv ${a.level} で解禁`
                    : !canCraft
                      ? "素材不足"
                      : "開始"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

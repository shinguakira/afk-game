import { useGame } from "../game/store";
import { ACTIONS_BY_SKILL, ITEM_MAP, SKILL_MAP } from "../game/data";
import { levelForXp, levelProgress, MAX_LEVEL, xpForLevel } from "../game/xp";
import { formatNumber } from "../ui/format";
import { Bar } from "./Bar";
import { TimerBar } from "./TimerBar";
import { Icon } from "../ui/icons";

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
        <Icon name={skill.icon} size={22} /> {skill.name}
        {skill.tech && (
          <span className="muted" style={{ fontSize: 13, marginLeft: 8 }}>
            {skill.tech === "language" ? "言語" : "フレームワーク"}
          </span>
        )}
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
          const isActive =
            state.active?.kind === "skill" && state.active.actionId === a.id;
          // フレームワークは対応言語のレベルが前提。
          const req = a.requires;
          const reqLevel = req ? levelForXp(state.skills[req.skill]?.xp ?? 0) : 0;
          const reqMet = !req || reqLevel >= req.level;
          const unlocked = level >= a.level && reqMet;
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
                {(a.time / 1000).toFixed(1)}s · {a.xp} xp
                {req && (
                  <>
                    {" · 要 "}
                    <Icon name={SKILL_MAP[req.skill]?.icon} size={12} />{" "}
                    {SKILL_MAP[req.skill]?.name} Lv{req.level}
                  </>
                )}
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
                  {!reqMet
                    ? `${SKILL_MAP[req!.skill]?.name} Lv${req!.level} が必要`
                    : level < a.level
                      ? `Lv ${a.level} で解禁`
                      : !canCraft
                        ? "コミット不足"
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

import { useGame } from "../store";
import { ACTIONS_BY_SKILL, ITEM_MAP, SKILL_MAP } from "../constants/maps";
import type { ActionCategory, GameAction } from "../types/skills";
import { levelForXp, levelProgress, MAX_LEVEL, xpForLevel } from "../lib/xp";
import { formatNumber } from "../lib/format";
import { Bar } from "./Bar";
import { TimerBar } from "./TimerBar";
import { Icon } from "./icons";

const CATEGORY_ORDER: ActionCategory[] = ["base", "concept", "library", "framework", "oss", "cert"];
const CATEGORY_LABEL: Record<ActionCategory, string> = {
  base: "基礎",
  concept: "概念",
  library: "ライブラリ",
  framework: "フレームワーク",
  oss: "OSS 活動",
  cert: "資格",
};
const CATEGORY_ICON: Record<ActionCategory, string> = {
  base: "commit",
  concept: "concept",
  library: "library",
  framework: "framework",
  oss: "oss",
  cert: "cert",
};

function ioTags(io: Partial<Record<string, number>> | undefined) {
  if (!io) return null;
  return Object.entries(io).map(([id, q]) => (
    <span className="tag" key={id}>
      <Icon name={ITEM_MAP[id]?.icon} size={11} /> {q}× {ITEM_MAP[id]?.name ?? id}
    </span>
  ));
}

export function SkillView({ skillId }: { skillId: string }) {
  const state = useGame();
  const skill = SKILL_MAP[skillId];
  const actions = ACTIONS_BY_SKILL[skillId] ?? [];
  const xp = state.skills[skillId]?.xp ?? 0;
  const level = levelForXp(xp);

  const isLang = skill.tech === "language";
  const byCat = new Map<ActionCategory, GameAction[]>();
  for (const a of actions) {
    // 言語以外(料理/PC組み立て)は1グループにまとめる。
    const c = isLang ? (a.category ?? "base") : "base";
    if (!byCat.has(c)) byCat.set(c, []);
    byCat.get(c)!.push(a);
  }

  return (
    <div>
      <h2 className="section-title">
        <Icon name={skill.icon} size={22} /> {skill.name}
        {skill.tech && (
          <span className="muted" style={{ fontSize: 13, marginLeft: 8 }}>
            {skill.tech === "language" ? "言語" : "フレームワーク"}
          </span>
        )}
        {skill.url && (
          <a
            href={skill.url}
            target="_blank"
            rel="noopener noreferrer"
            title="公式サイトを開く"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              marginLeft: 8,
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            <Icon name="extlink" size={14} /> 公式
          </a>
        )}
      </h2>
      <div style={{ maxWidth: 420, marginBottom: 20 }}>
        <Bar
          kind="xp"
          value={levelProgress(xp)}
          label={`Lv ${level}`}
          right={
            level >= MAX_LEVEL
              ? `${formatNumber(xp)} xp (max)`
              : `${formatNumber(xp)} / ${formatNumber(xpForLevel(level + 1))} xp`
          }
        />
      </div>

      {CATEGORY_ORDER.filter((c) => byCat.has(c)).map((cat) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          {isLang && (
            <h3 style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 10px" }}>
              <Icon name={CATEGORY_ICON[cat]} size={16} /> {CATEGORY_LABEL[cat]}
            </h3>
          )}
          <div className="grid">
            {byCat.get(cat)!.map((a) => {
              const unlocked = level >= a.level;
              const isActive = state.active?.kind === "skill" && state.active.actionId === a.id;
              const canCraft =
                !a.inputs ||
                Object.entries(a.inputs).every(([id, q]) => (state.bank[id] ?? 0) >= (q as number));

              return (
                <div
                  key={a.id}
                  className={`card ${!unlocked ? "locked" : ""} ${isActive ? "selected" : ""}`}
                >
                  <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name={a.icon} size={16} /> {a.name}
                    {a.url && (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="公式サイトを開く"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "inline-flex", marginLeft: "auto" }}
                      >
                        <Icon name="extlink" size={14} />
                      </a>
                    )}
                  </h3>
                  <div className="meta">
                    {!unlocked && (
                      <span style={{ color: "var(--danger)" }}>Lv {a.level} 必要 · </span>
                    )}
                    {(a.time / 1000).toFixed(1)}s · {Math.round(a.xp)} xp
                    {a.xpAlso && SKILL_MAP[a.xpAlso.skill] && (
                      <span className="tag" style={{ marginLeft: 6 }}>
                        <Icon name={SKILL_MAP[a.xpAlso.skill].icon} size={11} />{" "}
                        {SKILL_MAP[a.xpAlso.skill].name} +{Math.round(a.xpAlso.xp)}
                      </span>
                    )}
                  </div>
                  <div className="io">
                    {a.inputs && (
                      <div>
                        <span className="muted">消費: </span>
                        {ioTags(a.inputs)}
                      </div>
                    )}
                    {a.outputs && Object.keys(a.outputs).length > 0 && (
                      <div>
                        <span className="muted">産出: </span>
                        {ioTags(a.outputs)}
                      </div>
                    )}
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
                        ? `Lv ${a.level} で解禁（開始不可）`
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
      ))}
    </div>
  );
}

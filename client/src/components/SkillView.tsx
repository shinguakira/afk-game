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
    <span
      className="mr-1 my-0.5 inline-block rounded-md border border-border bg-panel px-1.5 py-px text-[11px]"
      key={id}
    >
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
      <h2 className="mb-1 flex items-center gap-2 text-lg">
        <Icon name={skill.icon} size={22} /> {skill.name}
        {skill.tech && (
          <span className="ml-2 text-[13px] text-muted">
            {skill.tech === "language" ? "言語" : "フレームワーク"}
          </span>
        )}
        {skill.url && (
          <a
            href={skill.url}
            target="_blank"
            rel="noopener noreferrer"
            title="公式サイトを開く"
            className="ml-2 inline-flex items-center gap-[3px] text-xs no-underline"
          >
            <Icon name="extlink" size={14} /> 公式
          </a>
        )}
      </h2>
      <div className="mb-5 max-w-[420px]">
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
        <div key={cat} className="mb-[18px]">
          {isLang && (
            <h3 className="mb-2.5 flex items-center gap-1.5">
              <Icon name={CATEGORY_ICON[cat]} size={16} /> {CATEGORY_LABEL[cat]}
            </h3>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {byCat.get(cat)!.map((a) => {
              const unlocked = level >= a.level;
              const isActive = state.active?.kind === "skill" && state.active.actionId === a.id;
              const canCraft =
                !a.inputs ||
                Object.entries(a.inputs).every(([id, q]) => (state.bank[id] ?? 0) >= (q as number));

              return (
                <div
                  key={a.id}
                  className={`rounded-[10px] border bg-panel2 p-3 ${!unlocked ? "opacity-50" : ""} ${isActive ? "border-accent2" : "border-border"}`}
                >
                  <h3 className="flex items-center gap-1.5">
                    <Icon name={a.icon} size={16} /> {a.name}
                    {a.url && (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="公式サイトを開く"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto inline-flex"
                      >
                        <Icon name="extlink" size={14} />
                      </a>
                    )}
                  </h3>
                  <div className="mb-2 text-xs text-muted">
                    {!unlocked && <span className="text-danger">Lv {a.level} 必要 · </span>}
                    {(a.time / 1000).toFixed(1)}s · {Math.round(a.xp)} xp
                    {a.xpAlso && SKILL_MAP[a.xpAlso.skill] && (
                      <span className="mr-1 my-0.5 ml-1.5 inline-block rounded-md border border-border bg-panel px-1.5 py-px text-[11px]">
                        <Icon name={SKILL_MAP[a.xpAlso.skill].icon} size={11} />{" "}
                        {SKILL_MAP[a.xpAlso.skill].name} +{Math.round(a.xpAlso.xp)}
                      </span>
                    )}
                  </div>
                  <div className="mb-2 text-xs">
                    {a.inputs && (
                      <div>
                        <span className="text-muted">消費: </span>
                        {ioTags(a.inputs)}
                      </div>
                    )}
                    {a.outputs && Object.keys(a.outputs).length > 0 && (
                      <div>
                        <span className="text-muted">産出: </span>
                        {ioTags(a.outputs)}
                      </div>
                    )}
                  </div>

                  {isActive ? (
                    <>
                      <TimerBar periodMs={a.time} running />
                      <button
                        className="mt-2 w-full border-danger text-danger"
                        onClick={() => state.stop()}
                      >
                        中断
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full border-accent bg-accent font-semibold text-[#06101f]"
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

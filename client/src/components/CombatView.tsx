import { useGame } from "../store";
import { ITEM_MAP, MONSTER_MAP } from "../constants/maps";
import { MONSTERS } from "../constants/monsters";
import { getCombatStats } from "../lib/combat";
import { Bar } from "./Bar";
import { TimerBar } from "./TimerBar";
import { Icon } from "./icons";

export function CombatView() {
  const state = useGame();
  const stats = getCombatStats(state);
  const active = state.active;
  const inCombat = active?.kind === "combat";
  const monster = active?.kind === "combat" ? MONSTER_MAP[active.monsterId] : null;

  return (
    <div>
      <h2 className="mb-1 flex items-center gap-2 text-lg">
        <Icon name="projects" size={22} /> 案件（フリーランス）
      </h2>
      <p className="mb-4 text-[13px] text-muted">
        無所属で受けられる単発案件。自動で対応し、メンタル50%以下で装備中の食事を自動でとります。
        装備・食事は「装備」タブで設定。会社の案件は所属で解禁（予定）。
      </p>

      {/* Arena */}
      {inCombat && monster && (
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-panel2 p-4 text-center">
            <div className="text-5xl">
              <Icon name="company" size={44} />
            </div>
            <h3 className="my-1.5">あなた</h3>
            <Bar
              kind="hp"
              value={state.playerHp / stats.maxHp}
              right={`${Math.ceil(state.playerHp)}/${stats.maxHp}`}
            />
            <div style={{ marginTop: 8 }}>
              <TimerBar periodMs={stats.weaponSpeed} running={inCombat} label="Attack" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-panel2 p-4 text-center">
            <div className="text-5xl">
              <Icon name={monster.icon} size={44} />
            </div>
            <h3 className="my-1.5">{monster.name}</h3>
            <Bar
              kind="enemy"
              value={state.enemyHp / monster.hp}
              right={`${Math.max(0, Math.ceil(state.enemyHp))}/${monster.hp}`}
            />
            <div style={{ marginTop: 8 }}>
              <TimerBar periodMs={monster.speed} running={inCombat} label="Attack" />
            </div>
          </div>
        </div>
      )}

      {/* Monster picker */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {MONSTERS.map((m) => {
          const isActive = state.active?.kind === "combat" && state.active.monsterId === m.id;
          return (
            <div
              key={m.id}
              className={`rounded-[10px] border bg-panel2 p-3 ${isActive ? "border-accent2" : "border-border"}`}
            >
              <h3>
                <Icon name={m.icon} size={18} /> {m.name}
              </h3>
              <div className="mb-2 text-xs text-muted">
                規模 {m.hp} · 圧 {m.maxHit} · {m.xp} xp
              </div>
              <div className="mb-2 text-xs">
                <span className="text-muted">報酬: </span>
                {m.loot.map((d) => (
                  <span
                    className="mr-1 my-0.5 inline-block rounded-md border border-border bg-panel px-1.5 py-px text-[11px]"
                    key={d.item}
                  >
                    {ITEM_MAP[d.item]?.name ?? d.item}
                  </span>
                ))}
                <span className="mr-1 my-0.5 inline-block rounded-md border border-border bg-panel px-1.5 py-px text-[11px]">
                  ¥{m.goldMin}-{m.goldMax}
                </span>
              </div>
              {isActive ? (
                <button
                  className="border-danger text-danger"
                  style={{ width: "100%" }}
                  onClick={() => state.stop()}
                >
                  中断
                </button>
              ) : (
                <button
                  className="border-accent bg-accent font-semibold text-[#06101f]"
                  style={{ width: "100%" }}
                  onClick={() => state.startCombat(m.id)}
                >
                  着手
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

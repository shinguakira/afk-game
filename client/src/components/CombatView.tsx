import { useGame } from "../game/store";
import { ITEM_MAP, MONSTERS, MONSTER_MAP } from "../game/data";
import { getCombatStats } from "../game/combat";
import { Bar } from "./Bar";
import { TimerBar } from "./TimerBar";
import { Icon } from "../ui/icons";

export function CombatView() {
  const state = useGame();
  const stats = getCombatStats(state);
  const active = state.active;
  const inCombat = active?.kind === "combat";
  const monster = active?.kind === "combat" ? MONSTER_MAP[active.monsterId] : null;

  return (
    <div>
      <h2 className="section-title">
        <Icon name="projects" size={22} /> 案件（フリーランス）
      </h2>
      <p className="section-sub">
        無所属で受けられる単発案件。自動で対応し、メンタル50%以下で装備中の食事を自動でとります。
        装備・食事は「装備」タブで設定。会社の案件は所属で解禁（予定）。
      </p>

      {/* Arena */}
      {inCombat && monster && (
        <div className="combat-arena">
          <div className="fighter">
            <div className="big-ic">
              <Icon name="company" size={44} />
            </div>
            <h3>あなた</h3>
            <Bar
              kind="hp"
              value={state.playerHp / stats.maxHp}
              right={`${Math.ceil(state.playerHp)}/${stats.maxHp}`}
            />
            <div style={{ marginTop: 8 }}>
              <TimerBar
                periodMs={stats.weaponSpeed}
                running={inCombat}
                label="Attack"
              />
            </div>
          </div>
          <div className="fighter">
            <div className="big-ic">
              <Icon name={monster.icon} size={44} />
            </div>
            <h3>{monster.name}</h3>
            <Bar
              kind="enemy"
              value={state.enemyHp / monster.hp}
              right={`${Math.max(0, Math.ceil(state.enemyHp))}/${monster.hp}`}
            />
            <div style={{ marginTop: 8 }}>
              <TimerBar
                periodMs={monster.speed}
                running={inCombat}
                label="Attack"
              />
            </div>
          </div>
        </div>
      )}

      {/* Monster picker */}
      <div className="grid">
        {MONSTERS.map((m) => {
          const isActive =
            state.active?.kind === "combat" && state.active.monsterId === m.id;
          return (
            <div key={m.id} className={`card ${isActive ? "selected" : ""}`}>
              <h3>
                <Icon name={m.icon} size={18} /> {m.name}
              </h3>
              <div className="meta">
                規模 {m.hp} · 圧 {m.maxHit} · {m.xp} xp
              </div>
              <div className="io">
                <span className="muted">報酬: </span>
                {m.loot.map((d) => (
                  <span className="tag" key={d.item}>
                    {ITEM_MAP[d.item]?.name ?? d.item}
                  </span>
                ))}
                <span className="tag">¥{m.goldMin}-{m.goldMax}</span>
              </div>
              {isActive ? (
                <button
                  className="danger"
                  style={{ width: "100%" }}
                  onClick={() => state.stop()}
                >
                  中断
                </button>
              ) : (
                <button
                  className="primary"
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

import { useGame } from "../game/store";
import { ITEM_MAP, ITEMS, MONSTERS, MONSTER_MAP } from "../game/data";
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

  const foods = ITEMS.filter(
    (i) => i.type === "food" && (state.bank[i.id] ?? 0) > 0,
  );
  const weaponId = state.equipment.weapon;
  const equipped = weaponId ? ITEM_MAP[weaponId] : null;

  return (
    <div>
      <h2 className="section-title">
        <Icon name="projects" size={22} /> 案件遂行
      </h2>
      <p className="section-sub">
        自動で対応。メンタル50%以下で選択中の食事を自動でとります。デバイス/装備は「装備」タブで。
      </p>

      {/* Player loadout */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <strong>デバイス:</strong>{" "}
            {equipped ? (
              <>
                <Icon name={equipped.icon} size={14} /> {equipped.name}
              </>
            ) : (
              <span className="muted">素手（ベタ打ち）</span>
            )}
          </div>
          <div className="muted">
            実装力 {stats.maxHit} · 精度 {stats.attackRating} · 堅牢 {stats.defenceRating} ·{" "}
            {(stats.weaponSpeed / 1000).toFixed(1)}s/手
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <span className="muted">食事: </span>
          <button
            className={state.selectedFood == null ? "active" : ""}
            style={{ padding: "3px 8px", marginRight: 6 }}
            onClick={() => state.setFood(null)}
          >
            なし
          </button>
          {foods.map((f) => (
            <button
              key={f.id}
              className={state.selectedFood === f.id ? "active" : ""}
              style={{ padding: "3px 8px", marginRight: 6, marginBottom: 4 }}
              onClick={() => state.setFood(f.id)}
            >
              <Icon name={f.icon} size={13} /> {f.name} ×{state.bank[f.id]} (+{f.heals})
            </button>
          ))}
        </div>
      </div>

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

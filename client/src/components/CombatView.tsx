import { useGame } from "../game/store";
import { ITEM_MAP, ITEMS, MONSTERS, MONSTER_MAP } from "../game/data";
import { getCombatStats } from "../game/combat";
import { Bar } from "./Bar";
import { TimerBar } from "./TimerBar";

export function CombatView() {
  const state = useGame();
  const stats = getCombatStats(state);
  const active = state.active;
  const inCombat = active?.kind === "combat";
  const monster = active?.kind === "combat" ? MONSTER_MAP[active.monsterId] : null;

  const foods = ITEMS.filter(
    (i) => i.type === "food" && (state.bank[i.id] ?? 0) > 0,
  );
  const weapons = ITEMS.filter(
    (i) => i.type === "weapon" && (state.bank[i.id] ?? 0) > 0,
  );
  const equipped = state.equippedWeapon ? ITEM_MAP[state.equippedWeapon] : null;

  return (
    <div>
      <h2 className="section-title">🗡️ Combat</h2>
      <p className="section-sub">
        Auto-battle. You eat your selected food automatically below 50% HP.
      </p>

      {/* Player loadout */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <strong>Weapon:</strong>{" "}
            {equipped ? equipped.name : <span className="muted">Fists</span>}{" "}
            {equipped && (
              <button
                style={{ padding: "2px 8px", marginLeft: 6 }}
                onClick={() => state.unequip()}
              >
                Unequip
              </button>
            )}
          </div>
          <div className="muted">
            Max hit {stats.maxHit} · Acc {stats.attackRating} · Def{" "}
            {stats.defenceRating} · Speed {(stats.weaponSpeed / 1000).toFixed(1)}s
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <span className="muted">Equip: </span>
          {weapons.length === 0 && <span className="muted">— smith a weapon —</span>}
          {weapons.map((w) => (
            <button
              key={w.id}
              style={{ padding: "3px 8px", marginRight: 6 }}
              className={state.equippedWeapon === w.id ? "active" : ""}
              onClick={() => state.equip(w.id)}
            >
              {w.name} ×{state.bank[w.id]}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <span className="muted">Food: </span>
          <button
            className={state.selectedFood == null ? "active" : ""}
            style={{ padding: "3px 8px", marginRight: 6 }}
            onClick={() => state.setFood(null)}
          >
            None
          </button>
          {foods.map((f) => (
            <button
              key={f.id}
              className={state.selectedFood === f.id ? "active" : ""}
              style={{ padding: "3px 8px", marginRight: 6 }}
              onClick={() => state.setFood(f.id)}
            >
              {f.name} ×{state.bank[f.id]} (+{f.heals})
            </button>
          ))}
        </div>
      </div>

      {/* Arena */}
      {inCombat && monster && (
        <div className="combat-arena">
          <div className="fighter">
            <div className="big-ic">🧍</div>
            <h3>You</h3>
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
            <div className="big-ic">{monster.icon}</div>
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
                {m.icon} {m.name}
              </h3>
              <div className="meta">
                HP {m.hp} · Max hit {m.maxHit} · {m.xp} xp
              </div>
              <div className="io">
                <span className="muted">Drops: </span>
                {m.loot.map((d) => (
                  <span className="tag" key={d.item}>
                    {ITEM_MAP[d.item]?.name ?? d.item}
                  </span>
                ))}
                <span className="tag">💰 {m.goldMin}-{m.goldMax}</span>
              </div>
              {isActive ? (
                <button
                  className="danger"
                  style={{ width: "100%" }}
                  onClick={() => state.stop()}
                >
                  Stop
                </button>
              ) : (
                <button
                  className="primary"
                  style={{ width: "100%" }}
                  onClick={() => state.startCombat(m.id)}
                >
                  Fight
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

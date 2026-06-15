import { useGame } from "../game/store";
import { ITEMS } from "../game/data";
import { formatNumber } from "../ui/format";
import { Icon } from "../ui/icons";

export function ShopView() {
  const state = useGame();
  const foods = ITEMS.filter((i) => i.type === "food");
  const weapons = ITEMS.filter((i) => i.type === "weapon");

  return (
    <div>
      <h2 className="section-title">
        <Icon name="shop" size={22} /> 購買
      </h2>
      <p className="section-sub">
        所持{" "}
        <span style={{ color: "var(--gold)" }}>¥{formatNumber(state.gold)}</span>。
        カフェインでメンタルを保ち、エディタで案件を速く片付けよう。
      </p>

      <h3 style={{ margin: "0 0 8px" }}>カフェイン</h3>
      <div className="grid" style={{ marginBottom: 20 }}>
        {foods.map((f) => {
          const price = f.sellPrice * 3;
          return (
            <div className="card" key={f.id}>
              <h3>
                <Icon name={f.icon} size={16} /> {f.name}
              </h3>
              <div className="meta">
                メンタル+{f.heals} · ¥{price}
              </div>
              <div className="row" style={{ display: "flex", gap: 6 }}>
                <button
                  className="primary"
                  disabled={state.gold < price}
                  onClick={() => state.buyFood(f.id, 1)}
                >
                  1個
                </button>
                <button
                  disabled={state.gold < price * 10}
                  onClick={() => state.buyFood(f.id, 10)}
                >
                  10個
                </button>
                <button
                  disabled={state.gold < price}
                  onClick={() => state.buyFood(f.id, 100)}
                >
                  100個
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ margin: "0 0 8px" }}>エディタ</h3>
      <div className="grid">
        {weapons.map((w) => {
          const price = w.sellPrice * 3;
          const owned = state.bank[w.id] ?? 0;
          return (
            <div className="card" key={w.id}>
              <h3>
                <Icon name={w.icon} size={16} /> {w.name}
              </h3>
              <div className="meta">
                実装+{w.weapon?.strengthBonus} · 精度+{w.weapon?.attackBonus} ·{" "}
                {((w.weapon?.speed ?? 0) / 1000).toFixed(1)}s · ¥{price}
                {owned > 0 ? ` · 所持${owned}` : ""}
              </div>
              <button
                className="primary"
                style={{ width: "100%" }}
                disabled={state.gold < price}
                onClick={() => state.buyWeapon(w.id)}
              >
                購入
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

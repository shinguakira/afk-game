import { useGame } from "../game/store";
import { ITEMS } from "../game/data";
import { formatNumber } from "../ui/format";

export function ShopView() {
  const state = useGame();
  const foods = ITEMS.filter((i) => i.type === "food");

  return (
    <div>
      <h2 className="section-title">🏪 Shop</h2>
      <p className="section-sub">
        Buy food to survive combat. You have{" "}
        <span style={{ color: "var(--gold)" }}>{formatNumber(state.gold)}g</span>.
      </p>

      <div className="grid">
        {foods.map((f) => {
          const price = f.sellPrice * 3;
          return (
            <div className="card" key={f.id}>
              <h3>{f.name}</h3>
              <div className="meta">
                Heals {f.heals} HP · {price}g each
              </div>
              <div className="row" style={{ display: "flex", gap: 6 }}>
                <button
                  className="primary"
                  disabled={state.gold < price}
                  onClick={() => state.buyFood(f.id, 1)}
                >
                  Buy 1
                </button>
                <button
                  disabled={state.gold < price * 10}
                  onClick={() => state.buyFood(f.id, 10)}
                >
                  Buy 10
                </button>
                <button
                  disabled={state.gold < price}
                  onClick={() => state.buyFood(f.id, 100)}
                >
                  Buy 100
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useGame } from "../game/store";
import { ITEMS } from "../game/data";
import { formatNumber } from "../ui/format";

export function ShopView() {
  const state = useGame();
  const foods = ITEMS.filter((i) => i.type === "food");

  return (
    <div>
      <h2 className="section-title">🛒 購買</h2>
      <p className="section-sub">
        カフェインを買ってメンタルを保とう。所持{" "}
        <span style={{ color: "var(--gold)" }}>¥{formatNumber(state.gold)}</span>。
      </p>

      <div className="grid">
        {foods.map((f) => {
          const price = f.sellPrice * 3;
          return (
            <div className="card" key={f.id}>
              <h3>{f.name}</h3>
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
    </div>
  );
}

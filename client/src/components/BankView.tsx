import { useGame } from "../game/store";
import { ITEM_MAP } from "../game/data";
import { formatNumber } from "../ui/format";

export function BankView() {
  const state = useGame();
  const entries = Object.entries(state.bank).filter(([, q]) => q > 0);

  return (
    <div>
      <h2 className="section-title">🎒 Bank</h2>
      <p className="section-sub">
        {entries.length} item type{entries.length === 1 ? "" : "s"}. Equip weapons,
        or sell for gold.
      </p>

      {entries.length === 0 && (
        <p className="muted">Your bank is empty. Go gather something!</p>
      )}

      <div className="bank-grid">
        {entries.map(([id, qty]) => {
          const it = ITEM_MAP[id];
          if (!it) return null;
          const isWeapon = it.type === "weapon";
          return (
            <div className="bank-item" key={id}>
              <div>
                <span className="name">{it.name}</span>{" "}
                <span className="qty">×{formatNumber(qty)}</span>
              </div>
              <div className="muted" style={{ fontSize: 11 }}>
                {it.type}
                {it.heals ? ` · heals ${it.heals}` : ""}
                {it.weapon
                  ? ` · +${it.weapon.strengthBonus} str / +${it.weapon.attackBonus} acc`
                  : ""}{" "}
                · sells {it.sellPrice}g
              </div>
              <div className="row">
                {isWeapon && (
                  <button onClick={() => state.equip(id)}>Equip</button>
                )}
                <button onClick={() => state.sell(id, 1)}>Sell 1</button>
                <button onClick={() => state.sell(id, qty)}>Sell all</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useGame } from "../game/store";
import { ITEM_MAP } from "../game/data";
import { formatNumber } from "../ui/format";

export function BankView() {
  const state = useGame();
  const entries = Object.entries(state.bank).filter(([, q]) => q > 0);

  return (
    <div>
      <h2 className="section-title">🗄️ 成果物</h2>
      <p className="section-sub">
        {entries.length} 種類。エディタは装備、不要なものは売却して円に。
      </p>

      {entries.length === 0 && (
        <p className="muted">まだ何もありません。生産から始めましょう。</p>
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
                {it.heals ? ` · 回復 ${it.heals}` : ""}
                {it.weapon
                  ? ` · 実装+${it.weapon.strengthBonus} / 精度+${it.weapon.attackBonus}`
                  : ""}{" "}
                · ¥{it.sellPrice}
              </div>
              <div className="row">
                {isWeapon && (
                  <button onClick={() => state.equip(id)}>装備</button>
                )}
                <button onClick={() => state.sell(id, 1)}>1売却</button>
                <button onClick={() => state.sell(id, qty)}>全売却</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

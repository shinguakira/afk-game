import { useGame } from "../game/store";
import { ITEM_MAP } from "../game/data";
import type { ItemType } from "../game/types";
import { formatNumber } from "../ui/format";
import { Icon } from "../ui/icons";

const TYPE_LABEL: Record<ItemType, string> = {
  resource: "資源",
  product: "プロダクト",
  weapon: "デバイス",
  food: "飲食物",
  misc: "アイテム",
};

export function BankView() {
  const state = useGame();
  const entries = Object.entries(state.bank).filter(([, q]) => q > 0);

  return (
    <div>
      <h2 className="section-title">
        <Icon name="bank" size={22} /> 成果物
      </h2>
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
          const equippable = !!it.equip;
          return (
            <div className="bank-item" key={id}>
              <div>
                <Icon name={it.icon} size={14} />{" "}
                <span className="name">{it.name}</span>{" "}
                <span className="qty">×{formatNumber(qty)}</span>
              </div>
              <div className="muted" style={{ fontSize: 11 }}>
                {TYPE_LABEL[it.type]}
                {it.heals ? ` · 回復 ${it.heals}` : ""}
                {it.equip?.weapon
                  ? ` · 実装+${it.equip.weapon.strengthBonus} / 精度+${it.equip.weapon.attackBonus}`
                  : ""}{" "}
                · ¥{it.sellPrice}
              </div>
              <div className="row">
                {equippable && (
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

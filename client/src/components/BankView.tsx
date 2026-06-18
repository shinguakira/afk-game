import { useState } from "react";
import { useGame } from "../game/store";
import { ITEM_MAP } from "../game/data";
import type { ItemType } from "../game/types";
import { formatNumber } from "../ui/format";
import { Icon } from "../ui/icons";

const TYPE_LABEL: Record<ItemType, string> = {
  resource: "資源",
  product: "制作物",
  weapon: "デバイス",
  food: "飲食物",
  misc: "アイテム",
};

export function BankView() {
  const state = useGame();
  const entries = Object.entries(state.bank).filter(([, q]) => q > 0);
  const [selected, setSelected] = useState<string | null>(null);

  const sel = selected ? ITEM_MAP[selected] : null;
  const selQty = selected ? (state.bank[selected] ?? 0) : 0;

  return (
    <div>
      <h2 className="section-title">
        <Icon name="bank" size={22} /> ストレージ
      </h2>
      <p className="section-sub">{entries.length} 種類のアイテム。タイルを選んで装備/売却。</p>

      {/* 選択中アイテムの詳細＆操作 */}
      {sel && (
        <div className="card" style={{ marginBottom: 14, maxWidth: 520 }}>
          <div className="row-between">
            <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name={sel.icon} size={18} /> {sel.name}
              <span className="muted" style={{ fontSize: 11 }}>
                ×{formatNumber(selQty)}
              </span>
            </strong>
            <span className="tag">{TYPE_LABEL[sel.type]}</span>
          </div>
          <div className="muted" style={{ fontSize: 12, margin: "6px 0" }}>
            {sel.heals ? `メンタル回復 +${sel.heals} · ` : ""}
            {sel.equip?.weapon
              ? `実装+${sel.equip.weapon.strengthBonus} 精度+${sel.equip.weapon.attackBonus} · `
              : ""}
            売値 ¥{sel.sellPrice}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {sel.equip && (
              <button className="primary" onClick={() => state.equip(sel.id)}>
                装備
              </button>
            )}
            <button onClick={() => state.sell(sel.id, 1)}>1売却</button>
            <button
              onClick={() => {
                state.sell(sel.id, selQty);
                setSelected(null);
              }}
            >
              全売却 (¥{formatNumber(selQty * sel.sellPrice)})
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 && <p className="muted">まだ何もありません。生産から始めましょう。</p>}

      <div className="store-grid">
        {entries.map(([id, qty]) => {
          const it = ITEM_MAP[id];
          if (!it) return null;
          return (
            <button
              key={id}
              className={`store-tile ${selected === id ? "selected" : ""}`}
              title={it.name}
              onClick={() => setSelected(id)}
            >
              <Icon name={it.icon} size={40} />
              <span className="qty">{formatNumber(qty)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

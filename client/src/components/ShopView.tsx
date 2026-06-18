import { useState } from "react";
import { useGame, shopPrice } from "../game/store";
import { ITEM_MAP } from "../game/data";
import { formatNumber } from "../ui/format";
import { Icon } from "../ui/icons";

const SECTIONS: { title: string; icon: string; items: string[] }[] = [
  {
    title: "飲食物",
    icon: "coffee",
    items: [
      "water",
      "coffee",
      "cola",
      "onigiri",
      "cupramen",
      "energy_drink",
      "bento",
      "paid_leave",
    ],
  },
  {
    title: "食材（料理用）",
    icon: "cooking",
    items: ["rice", "noodles", "meat", "fish_ing", "veg", "dough"],
  },
  {
    title: "種・苗（農業用）",
    icon: "seed",
    items: [
      "seed_tomato",
      "seed_rice",
      "seed_carrot",
      "seed_edamame",
      "seed_wheat",
      "seed_shiitake",
      "seed_strawberry",
      "seed_apple",
      "seed_mint",
      "seed_ginger",
      "seed_lemon",
      "seed_grape",
      "seed_coffee",
      "seed_ginseng",
    ],
  },
  {
    title: "PCパーツ・電子部品",
    icon: "cpu",
    items: [
      "cpu_celeron",
      "cpu_i5",
      "cpu_i9",
      "gpu_igpu",
      "gpu_rtx4060",
      "gpu_rtx4090",
      "ram_8",
      "ram_32",
      "ssd_512",
      "ssd_2tb",
      "components",
    ],
  },
  {
    title: "デバイス",
    icon: "keyboard",
    items: ["membrane_kb", "mechanical_kb", "gaming_mouse", "hhkb", "realforce"],
  },
  {
    title: "ウェア・かばん・アイコン",
    icon: "shirt",
    items: [
      "tshirt",
      "hoodie",
      "workwear",
      "suit",
      "backpack",
      "tote",
      "bizbag",
      "neat_hair",
      "afro",
      "ponytail",
      "av_cat",
      "av_pixel",
      "av_anime",
    ],
  },
];

function BuyModal({ id, onClose }: { id: string; onClose: () => void }) {
  const state = useGame();
  const it = ITEM_MAP[id];
  if (!it) return null;
  const price = shopPrice(it.sellPrice);
  const maxAffordable = Math.floor(state.gold / price);
  const owned = state.bank[id] ?? 0;

  const QTYS = [1, 10, 100].filter((q) => q <= Math.max(1, maxAffordable));
  const buy = (q: number) => state.buyItem(id, q);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div className="store-tile" style={{ width: 56, height: 56, cursor: "default" }}>
            <Icon name={it.icon} size={44} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{it.name}</h2>
            <div className="muted" style={{ fontSize: 12 }}>
              単価 ¥{formatNumber(price)} ・ 所持 {owned}
              {it.heals ? ` ・ メンタル+${it.heals}` : ""}
            </div>
          </div>
        </div>

        <div className="row-between" style={{ margin: "10px 0" }}>
          <span className="muted">所持金</span>
          <span style={{ color: "var(--gold)" }}>¥{formatNumber(state.gold)}</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {QTYS.map((q) => (
            <button
              key={q}
              className="primary"
              disabled={state.gold < price * q}
              onClick={() => buy(q)}
            >
              {q}個 (¥{formatNumber(price * q)})
            </button>
          ))}
          {maxAffordable > 1 && (
            <button disabled={maxAffordable <= 0} onClick={() => buy(maxAffordable)}>
              最大 {maxAffordable}個
            </button>
          )}
        </div>

        <button style={{ width: "100%", marginTop: 16 }} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}

export function ShopView() {
  const state = useGame();
  const [buying, setBuying] = useState<string | null>(null);

  return (
    <div>
      <h2 className="section-title">
        <Icon name="shop" size={22} /> ショップ
      </h2>
      <p className="section-sub">
        所持 <span style={{ color: "var(--gold)" }}>¥{formatNumber(state.gold)}</span>。
        アイテムを選んで購入。
      </p>

      {SECTIONS.map((sec) => (
        <div key={sec.title} style={{ marginBottom: 18 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 8px" }}>
            <Icon name={sec.icon} size={16} /> {sec.title}
          </h3>
          <div className="store-grid">
            {sec.items.map((id) => {
              const it = ITEM_MAP[id];
              if (!it) return null;
              return (
                <button
                  key={id}
                  className="store-tile"
                  title={`${it.name} ¥${shopPrice(it.sellPrice)}`}
                  onClick={() => setBuying(id)}
                >
                  <Icon name={it.icon} size={40} />
                  <span className="price">¥{formatNumber(shopPrice(it.sellPrice))}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {buying && <BuyModal id={buying} onClose={() => setBuying(null)} />}
    </div>
  );
}

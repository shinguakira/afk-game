import { useGame, shopPrice } from "../game/store";
import { ITEM_MAP } from "../game/data";
import { formatNumber } from "../ui/format";
import { Icon } from "../ui/icons";

// ショップの品揃え（id を直接指定）。
const SECTIONS: { title: string; icon: string; items: string[] }[] = [
  {
    title: "飲食物",
    icon: "coffee",
    items: ["water", "coffee", "cola", "onigiri", "cupramen", "energy_drink", "bento", "paid_leave"],
  },
  {
    title: "食材（料理用）",
    icon: "cooking",
    items: ["rice", "noodles", "meat", "fish_ing", "veg", "dough"],
  },
  {
    title: "PCパーツ（組み立て用）",
    icon: "cpu",
    items: ["cpu_celeron", "cpu_i5", "cpu_i9", "gpu_igpu", "gpu_rtx4060", "gpu_rtx4090", "ram_8", "ram_32", "ssd_512", "ssd_2tb"],
  },
  {
    title: "デバイス（武器）",
    icon: "keyboard",
    items: ["membrane_kb", "mechanical_kb", "gaming_mouse", "hhkb", "realforce"],
  },
  {
    title: "服・髪・アイコン",
    icon: "shirt",
    items: ["tshirt", "hoodie", "workwear", "suit", "neat_hair", "afro", "ponytail", "av_cat", "av_pixel", "av_anime"],
  },
];

export function ShopView() {
  const state = useGame();

  return (
    <div>
      <h2 className="section-title">
        <Icon name="shop" size={22} /> 購買
      </h2>
      <p className="section-sub">
        所持{" "}
        <span style={{ color: "var(--gold)" }}>¥{formatNumber(state.gold)}</span>。
        食事でメンタル回復、パーツでPC自作、デバイス/服で強化。
      </p>

      {SECTIONS.map((sec) => (
        <div key={sec.title} style={{ marginBottom: 20 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 8px" }}>
            <Icon name={sec.icon} size={16} /> {sec.title}
          </h3>
          <div className="grid">
            {sec.items.map((id) => {
              const it = ITEM_MAP[id];
              if (!it) return null;
              const price = shopPrice(it.sellPrice);
              return (
                <div className="card" key={id}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name={it.icon} size={16} /> {it.name}
                  </h3>
                  <div className="meta">
                    {it.heals ? `メンタル+${it.heals} · ` : ""}
                    {it.equip?.weapon
                      ? `実装+${it.equip.weapon.strengthBonus} 精度+${it.equip.weapon.attackBonus} · `
                      : ""}
                    ¥{price}
                    {(state.bank[id] ?? 0) > 0 ? ` · 所持${state.bank[id]}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="primary"
                      style={{ flex: 1 }}
                      disabled={state.gold < price}
                      onClick={() => state.buyItem(id, 1)}
                    >
                      購入
                    </button>
                    <button
                      disabled={state.gold < price * 10}
                      onClick={() => state.buyItem(id, 10)}
                    >
                      ×10
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

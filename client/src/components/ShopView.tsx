import { useState } from "react";
import { useGame, shopPrice } from "../store";
import { ITEM_MAP } from "../constants/maps";
import { formatNumber } from "../lib/format";
import { Icon } from "./icons";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[min(440px,92vw)] rounded-[14px] border border-border bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-panel2">
            <Icon name={it.icon} size={44} />
          </div>
          <div>
            <h2>{it.name}</h2>
            <div className="text-xs text-muted">
              単価 ¥{formatNumber(price)} ・ 所持 {owned}
              {it.heals ? ` ・ メンタル+${it.heals}` : ""}
            </div>
          </div>
        </div>

        <div className="my-2.5 flex items-center justify-between">
          <span className="text-muted">所持金</span>
          <span className="text-gold">¥{formatNumber(state.gold)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {QTYS.map((q) => (
            <button
              key={q}
              className="border-accent bg-accent font-semibold text-[#06101f]"
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

        <button className="mt-4 w-full" onClick={onClose}>
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
      <h2 className="mb-1 flex items-center gap-2 text-lg">
        <Icon name="shop" size={22} /> ショップ
      </h2>
      <p className="mb-4 text-[13px] text-muted">
        所持 <span className="text-gold">¥{formatNumber(state.gold)}</span>。 アイテムを選んで購入。
      </p>

      {SECTIONS.map((sec) => (
        <div key={sec.title} className="mb-[18px]">
          <h3 className="mb-2 flex items-center gap-1.5">
            <Icon name={sec.icon} size={16} /> {sec.title}
          </h3>
          <div className="grid max-w-[600px] grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
            {sec.items.map((id) => {
              const it = ITEM_MAP[id];
              if (!it) return null;
              return (
                <button
                  key={id}
                  className="relative flex aspect-square items-center justify-center rounded-lg border border-border bg-panel2 p-0 hover:border-accent"
                  title={`${it.name} ¥${shopPrice(it.sellPrice)}`}
                  onClick={() => setBuying(id)}
                >
                  <span className="flex h-4/5 w-4/5 items-center justify-center [&_svg]:h-full [&_svg]:w-full">
                    <Icon name={it.icon} size={40} />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 rounded-b-[7px] bg-black/50 py-px text-center text-[9px] font-bold text-gold">
                    ¥{formatNumber(shopPrice(it.sellPrice))}
                  </span>
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

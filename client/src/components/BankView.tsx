import { useState } from "react";
import { useGame } from "@/store";
import { ITEM_MAP } from "@/constants/maps";
import type { ItemType } from "@/types/items";
import { formatNumber } from "@/lib/format";
import { Icon } from "@/components/icons";

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
      <h2 className="mb-1 flex items-center gap-2 text-lg">
        <Icon name="bank" size={22} /> ストレージ
      </h2>
      <p className="mb-4 text-[13px] text-muted">
        {entries.length} 種類のアイテム。タイルを選んで装備/売却。
      </p>

      {/* 選択中アイテムの詳細＆操作 */}
      {sel && (
        <div className="mb-3.5 max-w-[520px] rounded-[10px] border border-border bg-panel2 p-3">
          <div className="flex items-center justify-between">
            <strong className="flex items-center gap-2">
              <Icon name={sel.icon} size={18} /> {sel.name}
              <span className="text-[11px] text-muted">×{formatNumber(selQty)}</span>
            </strong>
            <span className="mr-1 my-0.5 inline-block rounded-md border border-border bg-panel px-1.5 py-px text-[11px]">
              {TYPE_LABEL[sel.type]}
            </span>
          </div>
          <div className="my-1.5 text-xs text-muted">
            {sel.heals ? `メンタル回復 +${sel.heals} · ` : ""}
            {sel.equip?.weapon
              ? `実装+${sel.equip.weapon.strengthBonus} 精度+${sel.equip.weapon.attackBonus} · `
              : ""}
            売値 ¥{sel.sellPrice}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sel.equip && (
              <button
                className="border-accent bg-accent font-semibold text-[#06101f]"
                onClick={() => state.equip(sel.id)}
              >
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

      {entries.length === 0 && (
        <p className="text-muted">まだ何もありません。生産から始めましょう。</p>
      )}

      <div className="grid max-w-[600px] grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
        {entries.map(([id, qty]) => {
          const it = ITEM_MAP[id];
          if (!it) return null;
          return (
            <button
              key={id}
              className={`relative flex aspect-square items-center justify-center rounded-lg border bg-panel2 p-0 hover:border-accent ${selected === id ? "border-accent2" : "border-border"}`}
              title={it.name}
              onClick={() => setSelected(id)}
            >
              <span className="flex h-4/5 w-4/5 items-center justify-center [&_svg]:h-full [&_svg]:w-full">
                <Icon name={it.icon} size={40} />
              </span>
              <span className="absolute right-[3px] bottom-0.5 rounded bg-black/55 px-[3px] text-[10px] font-bold text-accent2">
                {formatNumber(qty)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

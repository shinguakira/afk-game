import { useState } from "react";
import { useGame } from "../store";
import { ITEMS } from "../constants/items";
import { ITEM_MAP } from "../constants/maps";
import type { EquipSlot } from "../types/items";
import { EFFECT_LABEL } from "../lib/modifiers";
import { Icon } from "./icons";

// food は装備スロットではないが、UI上は「食事スロット」として並べる。
type SlotKey = EquipSlot | "food";

const SLOTS: { slot: SlotKey; area: string; label: string; icon: string }[] = [
  { slot: "hair", area: "hair", label: "髪型", icon: "hair" },
  { slot: "weapon", area: "weapon", label: "デバイス", icon: "keyboard" },
  { slot: "body", area: "body", label: "ウェア", icon: "shirt" },
  { slot: "bag", area: "bag", label: "かばん", icon: "bag" },
  { slot: "pc", area: "pc", label: "マシン", icon: "pc" },
  { slot: "food", area: "food", label: "食事", icon: "coffee" },
  { slot: "avatar", area: "avatar", label: "アイコン", icon: "avatar" },
];

function bonusText(itemId: string): string {
  const it = ITEM_MAP[itemId];
  if (!it) return "";
  if (it.heals) return `メンタル回復 +${it.heals}`;
  const eq = it.equip;
  if (!eq) return "";
  if (eq.weapon)
    return `実装+${eq.weapon.strengthBonus} 精度+${eq.weapon.attackBonus} ${(eq.weapon.speed / 1000).toFixed(1)}s`;
  if (!eq.modifiers?.length) return "効果なし";
  return eq.modifiers.map((m) => `${EFFECT_LABEL[m.key] ?? m.key}+${m.pct}%`).join(" ");
}

export function EquipView() {
  const state = useGame();
  const [picking, setPicking] = useState<SlotKey | null>(null);

  const equippedId = (slot: SlotKey): string | undefined =>
    slot === "food" ? (state.selectedFood ?? undefined) : state.equipment[slot];

  const optionsFor = (slot: SlotKey) =>
    ITEMS.filter((it) =>
      slot === "food"
        ? it.type === "food" && (state.bank[it.id] ?? 0) > 0
        : it.equip?.slot === slot && (state.bank[it.id] ?? 0) > 0,
    );

  const doEquip = (slot: SlotKey, id: string) =>
    slot === "food" ? state.setFood(id) : state.equip(id);
  const doUnequip = (slot: SlotKey) =>
    slot === "food" ? state.setFood(null) : state.unequip(slot as EquipSlot);

  return (
    <div>
      <h2 className="section-title">
        <Icon name="company" size={22} /> 装備
      </h2>
      <p className="section-sub">スロットをクリックして、所持アイテムから装備します。</p>

      <div className="equip-doll">
        {/* 中央の人物 */}
        <div className="equip-figure" style={{ gridArea: "figure" }}>
          <svg width="120" height="180" viewBox="0 0 60 90">
            <circle cx="30" cy="16" r="11" fill="#3a4554" stroke="#5a6a7a" strokeWidth="1.5" />
            <path
              d="M14 40c0-9 7-15 16-15s16 6 16 15v22a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z"
              fill="#3a4554"
            />
            <rect x="12" y="40" width="6" height="26" rx="3" fill="#3a4554" />
            <rect x="42" y="40" width="6" height="26" rx="3" fill="#3a4554" />
            <rect x="20" y="66" width="8" height="22" rx="3" fill="#2f3a48" />
            <rect x="32" y="66" width="8" height="22" rx="3" fill="#2f3a48" />
          </svg>
        </div>

        {SLOTS.map(({ slot, area, label, icon }) => {
          const id = equippedId(slot);
          const it = id ? ITEM_MAP[id] : null;
          return (
            <button
              key={slot}
              className={`equip-slot ${it ? "filled" : ""}`}
              style={{ gridArea: area }}
              onClick={() => setPicking(slot)}
              title={label}
            >
              <span className="eslot-label">{label}</span>
              <div className="eslot-icon">
                <Icon name={it ? it.icon : icon} size={it ? 34 : 22} />
              </div>
              <span className="eslot-name">{it ? it.name : "空き"}</span>
            </button>
          );
        })}
      </div>

      {/* スロットのピッカー（モーダル） */}
      {picking && (
        <div className="modal-backdrop" onClick={() => setPicking(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{SLOTS.find((s) => s.slot === picking)?.label} を選ぶ</h2>

            <button
              className="nav-item"
              style={{ width: "100%", marginBottom: 8 }}
              onClick={() => {
                doUnequip(picking);
                setPicking(null);
              }}
            >
              <Icon name="stop" size={14} /> 外す
            </button>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {optionsFor(picking).length === 0 && (
                <span className="muted" style={{ fontSize: 13 }}>
                  所持しているアイテムがありません（ショップ/制作で入手）。
                </span>
              )}
              {optionsFor(picking).map((it) => (
                <button
                  key={it.id}
                  className={`nav-item ${equippedId(picking) === it.id ? "selected" : ""}`}
                  onClick={() => {
                    doEquip(picking, it.id);
                    setPicking(null);
                  }}
                >
                  <Icon name={it.icon} size={20} />
                  <span style={{ flex: 1, textAlign: "left" }}>
                    {it.name} <span className="muted">×{state.bank[it.id]}</span>
                  </span>
                  <span className="muted" style={{ fontSize: 11 }}>
                    {bonusText(it.id)}
                  </span>
                </button>
              ))}
            </div>

            <button style={{ width: "100%", marginTop: 14 }} onClick={() => setPicking(null)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

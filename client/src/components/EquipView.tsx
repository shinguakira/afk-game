import { useGame } from "../game/store";
import { ITEMS, ITEM_MAP } from "../game/data";
import type { EquipSlot } from "../game/types";
import { EFFECT_LABEL } from "../game/modifiers";
import { Icon } from "../ui/icons";

const SLOTS: { slot: EquipSlot; name: string; icon: string }[] = [
  { slot: "weapon", name: "デバイス", icon: "keyboard" },
  { slot: "body", name: "服", icon: "shirt" },
  { slot: "hair", name: "髪型", icon: "hair" },
  { slot: "avatar", name: "アイコン", icon: "avatar" },
  { slot: "pc", name: "PC", icon: "pc" },
];

function bonusTags(itemId: string | undefined) {
  const eq = itemId ? ITEM_MAP[itemId]?.equip : undefined;
  if (!eq) return null;
  if (eq.weapon) {
    return (
      <span className="muted" style={{ fontSize: 11 }}>
        実装+{eq.weapon.strengthBonus} · 精度+{eq.weapon.attackBonus} ·{" "}
        {(eq.weapon.speed / 1000).toFixed(1)}s
      </span>
    );
  }
  if (!eq.modifiers?.length)
    return <span className="muted" style={{ fontSize: 11 }}>効果なし</span>;
  return (
    <>
      {eq.modifiers.map((m, i) => (
        <span className="tag" key={i} style={{ color: "var(--accent-2)" }}>
          {EFFECT_LABEL[m.key] ?? m.key} +{m.pct}%
        </span>
      ))}
    </>
  );
}

export function EquipView() {
  const state = useGame();

  return (
    <div>
      <h2 className="section-title">
        <Icon name="company" size={22} /> 装備
      </h2>
      <p className="section-sub">
        デバイス(武器)・服・髪型・アイコン・PC を装備。バンクの装備品から選べます。
      </p>

      {SLOTS.map(({ slot, name, icon }) => {
        const equippedId = state.equipment[slot];
        const equipped = equippedId ? ITEM_MAP[equippedId] : null;
        // バンクにある、このスロット用の装備品
        const options = ITEMS.filter(
          (it) => it.equip?.slot === slot && (state.bank[it.id] ?? 0) > 0,
        );

        return (
          <div className="card" key={slot} style={{ marginBottom: 12 }}>
            <div className="row-between" style={{ marginBottom: 8 }}>
              <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name={icon} size={16} /> {name}
              </strong>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {equipped ? (
                  <>
                    <Icon name={equipped.icon} size={14} />
                    <span>{equipped.name}</span>
                    <button
                      style={{ padding: "2px 8px" }}
                      onClick={() => state.unequip(slot)}
                    >
                      外す
                    </button>
                  </>
                ) : (
                  <span className="muted">未装備</span>
                )}
              </div>
            </div>
            {equipped && <div className="io">{bonusTags(equippedId)}</div>}

            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {options.length === 0 && (
                <span className="muted" style={{ fontSize: 12 }}>
                  バンクに装備品がありません（ショップ/制作で入手）
                </span>
              )}
              {options.map((it) => (
                <button
                  key={it.id}
                  className={equippedId === it.id ? "active" : ""}
                  style={{ padding: "4px 8px" }}
                  onClick={() => state.equip(it.id)}
                >
                  <Icon name={it.icon} size={13} /> {it.name} ×{state.bank[it.id]}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

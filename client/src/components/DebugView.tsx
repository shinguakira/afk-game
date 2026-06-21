/**
 * DEV-ONLY データベースビューア。
 * import.meta.env.DEV が false のビルドでは App.tsx から参照されないため実行されない。
 */
import { useState } from "react";
import type { ReactNode } from "react";
import type { SaveState } from "@/types/save";
import { ITEMS } from "@/constants/items";
import { MONSTERS } from "@/constants/monsters";
import { SKILLS } from "@/constants/skills";
import { CLASSES } from "@/constants/classes";
import { FARM_CROPS } from "@/constants/farming";
import { ITEM_MAP, ACTIONS_BY_SKILL } from "@/constants/maps";
import { SAVE_VERSION } from "@/constants/config";
import { getCombatStats, avgPlayerDamage, avgEnemyDamage } from "@/lib/combat";
import { xpForLevel } from "@/lib/xp";
import { formatNumber, formatDuration } from "@/lib/format";
import { Icon } from "@/components/icons";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Section = "items" | "monsters" | "skills" | "actions" | "classes" | "crops" | "combat";

const SECTIONS: [Section, string][] = [
  ["items", "アイテム"],
  ["monsters", "モンスター"],
  ["skills", "スキル"],
  ["actions", "アクション"],
  ["classes", "クラス"],
  ["crops", "作物"],
  ["combat", "戦闘計算機"],
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Badge({ children, color = "text-muted" }: { children: ReactNode; color?: string }) {
  return (
    <span className={`rounded border border-border px-1 py-0.5 text-[10px] ${color}`}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Items
// ─────────────────────────────────────────────────────────────────────────────

function ItemsSection() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
      {ITEMS.map((item) => (
        <div key={item.id} className="rounded-[10px] border border-border bg-panel2 p-3">
          <div className="mb-2 flex items-start gap-2">
            <div className="mt-0.5 shrink-0">
              <Icon name={item.icon ?? item.id} size={32} />
            </div>
            <div className="min-w-0">
              <div className="font-medium leading-tight">{item.name}</div>
              <div className="font-mono text-[10px] text-muted">{item.id}</div>
              <div className="mt-0.5">
                <Badge>{item.type}</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-0.5 text-xs">
            <Row label="売値" value={<span className="text-gold">¥{item.sellPrice}</span>} />
            {item.heals !== undefined && (
              <Row label="回復" value={<span className="text-green-400">+{item.heals} HP</span>} />
            )}
            {item.equip && (
              <div className="mt-1.5 space-y-0.5 border-t border-border pt-1.5">
                <Row label="スロット" value={<Badge>{item.equip.slot}</Badge>} />
                {item.equip.weapon && (
                  <>
                    <Row
                      label="攻撃ボーナス"
                      value={<span className="text-accent">+{item.equip.weapon.attackBonus}</span>}
                    />
                    <Row
                      label="威力ボーナス"
                      value={<span className="text-accent">+{item.equip.weapon.strengthBonus}</span>}
                    />
                    <Row label="攻撃速度" value={`${item.equip.weapon.speed}ms`} />
                  </>
                )}
                {item.equip.modifiers?.map((m, i) => (
                  <Row
                    key={i}
                    label={m.note ?? m.key}
                    value={
                      <span className={m.pct >= 0 ? "text-green-400" : "text-red-400"}>
                        {m.pct > 0 ? "+" : ""}
                        {m.pct}%
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Monsters
// ─────────────────────────────────────────────────────────────────────────────

function MonstersSection() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
      {MONSTERS.map((m) => (
        <div key={m.id} className="rounded-[10px] border border-border bg-panel2 p-3">
          <div className="mb-3 flex items-center gap-2">
            <Icon name={m.icon} size={24} />
            <div>
              <div className="font-bold">{m.name}</div>
              <div className="font-mono text-[10px] text-muted">{m.id}</div>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs">
            <Row label="HP" value={m.hp} />
            <Row label="最大ヒット" value={m.maxHit} />
            <Row label="攻撃" value={m.attack} />
            <Row label="防御" value={m.defence} />
            <Row label="速度" value={`${m.speed}ms`} />
            <Row label="XP" value={<span className="text-accent">{m.xp}</span>} />
            <Row label="ゴールド" value={<span className="text-gold">¥{m.goldMin}–{m.goldMax}</span>} />
            {m.regen !== undefined && (
              <Row
                label="リジェネ"
                value={<span className="text-yellow-400">{m.regen}/s</span>}
              />
            )}
            {m.dot !== undefined && (
              <Row label="DoT" value={<span className="text-red-400">{m.dot}/s</span>} />
            )}
          </div>

          <div className="border-t border-border pt-2 text-xs">
            <div className="mb-1 text-muted">ドロップ</div>
            {m.loot.map((l, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Icon name={l.item} size={13} />
                <span>{ITEM_MAP[l.item]?.name ?? l.item}</span>
                <span className="ml-auto text-muted">
                  {l.min}–{l.max}個 ({Math.round(l.chance * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skills
// ─────────────────────────────────────────────────────────────────────────────

function SkillsSection() {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-left">
          <th className="pb-2 pr-3 text-xs font-normal text-muted">アイコン</th>
          <th className="pb-2 pr-3 text-xs font-normal text-muted">ID</th>
          <th className="pb-2 pr-3 text-xs font-normal text-muted">名前</th>
          <th className="pb-2 pr-3 text-xs font-normal text-muted">カテゴリ</th>
          <th className="pb-2 text-xs font-normal text-muted">種別</th>
        </tr>
      </thead>
      <tbody>
        {SKILLS.map((s) => (
          <tr key={s.id} className="border-b border-border/40 hover:bg-panel2">
            <td className="py-1.5 pr-3">
              <Icon name={s.icon} size={15} />
            </td>
            <td className="py-1.5 pr-3 font-mono text-[11px] text-muted">{s.id}</td>
            <td className="py-1.5 pr-3">{s.name}</td>
            <td className="py-1.5 pr-3">
              <Badge>{s.category}</Badge>
            </td>
            <td className="py-1.5">
              <Badge
                color={
                  s.kind === "combat"
                    ? "text-red-400"
                    : s.kind === "craft"
                      ? "text-yellow-400"
                      : "text-muted"
                }
              >
                {s.kind}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

function ActionsSection() {
  const skillsWithActions = SKILLS.filter((s) => (ACTIONS_BY_SKILL[s.id]?.length ?? 0) > 0);
  const [skillId, setSkillId] = useState(skillsWithActions[0]?.id ?? "");
  const actions = ACTIONS_BY_SKILL[skillId] ?? [];

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <select
          value={skillId}
          onChange={(e) => setSkillId(e.target.value)}
          className="rounded-md border border-border bg-panel2 px-2 py-1.5 text-sm text-text"
        >
          {skillsWithActions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({ACTIONS_BY_SKILL[s.id]?.length ?? 0})
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">{actions.length} アクション</span>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="pb-1.5 pr-3 font-normal">名前</th>
            <th className="pb-1.5 pr-3 font-normal">Lv</th>
            <th className="pb-1.5 pr-3 font-normal">時間</th>
            <th className="pb-1.5 pr-3 font-normal">XP</th>
            <th className="pb-1.5 pr-3 font-normal">副XP</th>
            <th className="pb-1.5 pr-3 font-normal">入力</th>
            <th className="pb-1.5 font-normal">出力</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a) => {
            const inputs = a.inputs ? Object.entries(a.inputs) : [];
            const outputs = Object.entries(a.outputs).filter(([, qty]) => qty !== undefined);
            return (
              <tr key={a.id} className="border-b border-border/30 hover:bg-panel2">
                <td className="py-1.5 pr-3">{a.name}</td>
                <td className="py-1.5 pr-3 text-muted">{a.level}</td>
                <td className="py-1.5 pr-3 tabular-nums text-muted">
                  {(a.time / 1000).toFixed(1)}s
                </td>
                <td className="py-1.5 pr-3 tabular-nums text-accent">{a.xp}</td>
                <td className="py-1.5 pr-3 text-muted">
                  {a.xpAlso ? (
                    <span className="text-[11px]">
                      {a.xpAlso.skill} +{a.xpAlso.xp}
                    </span>
                  ) : (
                    "─"
                  )}
                </td>
                <td className="py-1.5 pr-3">
                  {inputs.length > 0
                    ? inputs.map(([item, qty]) => (
                        <span
                          key={item}
                          className="mr-1.5 inline-flex items-center gap-0.5 text-muted"
                        >
                          <Icon name={item} size={11} />×{qty}
                        </span>
                      ))
                    : "─"}
                </td>
                <td className="py-1.5">
                  {outputs.length > 0
                    ? outputs.map(([item, qty]) => (
                        <span key={item} className="mr-1.5 inline-flex items-center gap-0.5">
                          <Icon name={item} size={11} />×{qty}
                        </span>
                      ))
                    : "─"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Classes
// ─────────────────────────────────────────────────────────────────────────────

function ClassesSection() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
      {CLASSES.map((c) => (
        <div key={c.id} className="rounded-[10px] border border-border bg-panel2 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Icon name={c.icon} size={22} />
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted">
                要ランク {c.requiresRank}
                {c.upgradesFrom && ` (${c.upgradesFrom.join(", ")} から)`}
              </div>
            </div>
          </div>
          {c.passive && <div className="mb-2 text-xs italic text-muted">{c.passive}</div>}
          <div className="space-y-0.5 text-xs">
            {c.modifiers.length === 0 && <div className="text-muted">補正なし</div>}
            {c.modifiers.map((mod, i) => (
              <div
                key={i}
                className={`flex justify-between ${mod.pct >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                <span className="text-muted">{mod.note ?? mod.key}</span>
                <span className="tabular-nums">
                  {mod.pct > 0 ? "+" : ""}
                  {mod.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Crops
// ─────────────────────────────────────────────────────────────────────────────

function CropsSection() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
      {FARM_CROPS.map((crop) => {
        const item = ITEM_MAP[crop.id];
        const seedItem = crop.seed ? ITEM_MAP[crop.seed] : undefined;
        return (
          <div key={crop.id} className="rounded-[10px] border border-border bg-panel2 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Icon name={item?.icon ?? crop.id} size={30} />
              <div>
                <div className="font-medium">{item?.name ?? crop.id}</div>
                <div className="font-mono text-[10px] text-muted">{crop.id}</div>
              </div>
            </div>
            <div className="space-y-0.5 text-xs">
              <Row label="解禁Lv" value={crop.level} />
              <Row label="成長時間" value={formatDuration(crop.growMs)} />
              <Row label="収量" value={`×${crop.yield}`} />
              <Row label="XP" value={<span className="text-accent">{crop.xp}</span>} />
              <Row
                label="種"
                value={
                  crop.seed ? (
                    <span className="flex items-center gap-1">
                      <Icon name={seedItem?.icon ?? crop.seed} size={11} />
                      {seedItem?.name ?? crop.seed}
                    </span>
                  ) : (
                    <span className="text-muted">不要</span>
                  )
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Combat calculator
// ─────────────────────────────────────────────────────────────────────────────

function makeCalcState(
  debug: number,
  impl: number,
  robust: number,
  mental: number,
): SaveState {
  return {
    version: SAVE_VERSION,
    skills: {
      debug: { xp: xpForLevel(debug) },
      impl: { xp: xpForLevel(impl) },
      robust: { xp: xpForLevel(robust) },
      mental: { xp: xpForLevel(mental) },
    },
    bank: {},
    gold: 0,
    jobClass: null,
    prestigePoints: 0,
    prestigeUpgrades: {},
    prestigeCount: 0,
    milestones: [],
    equipment: {},
    selectedFood: null,
    playerName: "",
    mainLang: null,
    interestLangs: [],
    onboarded: true,
    playerHp: mental * 10,
    active: null,
    actionProgress: 0,
    plots: [],
    lastSaved: 0,
  };
}

function CombatCalcSection() {
  const [debugLv, setDebugLv] = useState(10);
  const [implLv, setImplLv] = useState(10);
  const [robustLv, setRobustLv] = useState(10);
  const [mentalLv, setMentalLv] = useState(10);

  const state = makeCalcState(debugLv, implLv, robustLv, mentalLv);
  const cs = getCombatStats(state);

  const sliders: { id: string; label: string; val: number; set: (v: number) => void }[] = [
    { id: "debug", label: "デバッグ (精度)", val: debugLv, set: setDebugLv },
    { id: "impl", label: "実装 (威力)", val: implLv, set: setImplLv },
    { id: "robust", label: "堅牢性 (防御)", val: robustLv, set: setRobustLv },
    { id: "mental", label: "メンタル (HP)", val: mentalLv, set: setMentalLv },
  ];

  const statBoxes: [string, string | number][] = [
    ["maxHit", cs.maxHit],
    ["攻撃レート", cs.attackRating],
    ["防御レート", cs.defenceRating],
    ["最大HP", cs.maxHp],
    ["攻撃間隔", `${cs.weaponSpeed}ms`],
  ];

  return (
    <div className="space-y-4">
      {/* Sliders */}
      <div className="rounded-[10px] border border-border bg-panel2 p-4">
        <div className="mb-3 text-sm font-bold text-accent">スキルレベル (素手・補正なし)</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {sliders.map(({ id, label, val, set }) => (
            <div key={id}>
              <div className="mb-1 flex items-center gap-1 text-xs text-muted">
                <Icon name={id} size={12} />
                {label}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={99}
                  value={val}
                  onChange={(e) => set(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-6 text-right font-mono text-sm font-bold">{val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Computed combat stats */}
      <div className="rounded-[10px] border border-border bg-panel2 p-3">
        <div className="mb-2 text-xs text-muted">プレイヤー戦闘ステータス</div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {statBoxes.map(([label, val]) => (
            <div key={label} className="rounded-md bg-panel p-2 text-center">
              <div className="mb-0.5 text-[10px] text-muted">{label}</div>
              <div className="font-mono font-bold">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monster viability table */}
      <div className="overflow-hidden rounded-[10px] border border-border">
        <table className="w-full text-xs">
          <thead className="border-b border-border bg-panel2">
            <tr className="text-left text-muted">
              <th className="p-2 font-normal">モンスター</th>
              <th className="p-2 font-normal">DPS</th>
              <th className="p-2 font-normal">倒せる</th>
              <th className="p-2 font-normal">生存</th>
              <th className="p-2 font-normal">撃破時間</th>
              <th className="p-2 font-normal">HP消費</th>
              <th className="p-2 font-normal">収入/h</th>
            </tr>
          </thead>
          <tbody>
            {MONSTERS.map((m) => {
              const pDps = (avgPlayerDamage(cs, m) * 1000) / cs.weaponSpeed;
              const canKill = !m.regen || pDps > m.regen;

              let killTime = Infinity;
              let hpLost = Infinity;
              let gph = 0;
              let survives = false;

              if (canKill) {
                const netDps = m.regen ? pDps - m.regen : pDps;
                killTime = m.hp / netDps;
                const eDps = (avgEnemyDamage(cs, m) * 1000) / m.speed;
                hpLost = (eDps + (m.dot ?? 0)) * killTime;
                survives = hpLost < cs.maxHp;
                if (survives) {
                  gph = (((m.goldMin + m.goldMax) / 2) / killTime) * 3600;
                }
              }

              return (
                <tr key={m.id} className="border-b border-border/40 hover:bg-panel2">
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <Icon name={m.icon} size={13} />
                      <span>{m.name}</span>
                      {m.regen && (
                        <span className="text-[10px] text-yellow-400">regen</span>
                      )}
                      {m.dot && (
                        <span className="text-[10px] text-red-400">DoT</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 font-mono tabular-nums">{pDps.toFixed(3)}</td>
                  <td className="p-2">
                    {canKill ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="p-2">
                    {!canKill ? (
                      <span className="text-muted">─</span>
                    ) : survives ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="p-2 font-mono tabular-nums">
                    {canKill ? `${killTime.toFixed(1)}s` : "─"}
                  </td>
                  <td
                    className={`p-2 font-mono tabular-nums ${
                      canKill && hpLost > cs.maxHp ? "text-red-400" : ""
                    }`}
                  >
                    {canKill ? `${hpLost.toFixed(1)} / ${cs.maxHp}` : "─"}
                  </td>
                  <td className="p-2 font-mono tabular-nums text-gold">
                    {gph > 0 ? `¥${formatNumber(Math.round(gph))}` : "─"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────

export function DebugView({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<Section>("items");

  return (
    <div className="flex h-screen flex-col bg-panel text-text">
      {/* Header bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-panel2 px-4 py-2">
        <Icon name="database" size={18} />
        <span className="font-bold">Debug / DataViewer</span>
        <span className="rounded border border-yellow-500/40 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] text-yellow-400">
          DEV ONLY
        </span>
        <div className="flex flex-1 flex-wrap gap-1.5 px-2">
          {SECTIONS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                section === id
                  ? "border-accent bg-panel text-accent"
                  : "border-border bg-transparent text-muted hover:bg-panel"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="ml-auto rounded-md border border-border px-3 py-1 text-sm text-muted hover:bg-panel hover:text-text"
        >
          ✕ 閉じる
        </button>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {section === "items" && <ItemsSection />}
        {section === "monsters" && <MonstersSection />}
        {section === "skills" && <SkillsSection />}
        {section === "actions" && <ActionsSection />}
        {section === "classes" && <ClassesSection />}
        {section === "crops" && <CropsSection />}
        {section === "combat" && <CombatCalcSection />}
      </div>
    </div>
  );
}

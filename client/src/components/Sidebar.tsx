import { useEffect, useState } from "react";
import { useGame } from "@/store";
import { CATEGORIES } from "@/constants/categories";
import { CLASS_MAP, SKILLS_BY_CATEGORY, SKILL_MAP } from "@/constants/maps";
import { COMBAT_STAT_IDS } from "@/constants/skills";
import { levelForXp } from "@/lib/xp";
import { toggleInSet } from "@/lib/util";
import { currentRank } from "@/lib/rank";
import { getCombatStats } from "@/lib/combat";
import { Icon } from "@/components/icons";
import { Bar } from "@/components/Bar";
import { formatNumber } from "@/lib/format";

export type Tab = string;

interface SidebarProps {
  tab: Tab;
  setTab: (t: Tab) => void;
}

const MENU: [tab: string, icon: string, label: string][] = [
  ["combat", "projects", "案件"],
  ["roadmap", "roadmap", "ロードマップ"],
  ["bank", "bank", "ストレージ"],
  ["shop", "shop", "ショップ"],
  ["equip", "company", "装備"],
  ["career", "career", "キャリア"],
  ["prestige", "prestige", "起業"],
];

function StatusBlock() {
  const state = useGame();
  const rank = currentRank(state);
  const stats = getCombatStats(state);
  const className = CLASS_MAP[state.jobClass ?? "none"]?.name ?? "無所属";
  const engLevel = Math.floor(
    COMBAT_STAT_IDS.reduce((s, id) => s + levelForXp(state.skills[id]?.xp ?? 0), 0) /
      COMBAT_STAT_IDS.length,
  );
  return (
    <div className="mb-2 rounded-[10px] border border-border bg-panel2 p-2.5">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-[13px] font-bold">{rank.name}</span>
        <span className="font-bold text-gold">¥{formatNumber(state.gold)}</span>
      </div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
        <span>{className}</span>
        <span>Eng Lv {engLevel}</span>
      </div>
      <Bar
        kind="hp"
        value={state.playerHp / stats.maxHp}
        right={`${Math.ceil(state.playerHp)}/${stats.maxHp}`}
        label="メンタル"
      />
      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-muted">
        <span>
          <Icon name="impl" size={11} /> 実装 {stats.maxHit}
        </span>
        <span>
          <Icon name="debug" size={11} /> 精度 {stats.attackRating}
        </span>
        <span>
          <Icon name="robust" size={11} /> 堅牢 {stats.defenceRating}
        </span>
      </div>
    </div>
  );
}

const NAV_SECTION =
  "mx-1.5 mt-3.5 mb-1 border-b border-border pb-1 text-[11px] font-bold tracking-[1px] text-accent";
const navItemCls = (selected: boolean, sub = false) =>
  `mb-1 flex w-full items-center gap-2.5 border text-left ${
    selected ? "border-accent bg-panel2" : "border-transparent bg-transparent hover:bg-panel2"
  }${sub ? " pl-[18px]" : ""}`;

export function Sidebar({ tab, setTab }: SidebarProps) {
  const skills = useGame((s) => s.skills);
  const mainLang = useGame((s) => s.mainLang);
  const interestLangs = useGame((s) => s.interestLangs);

  // アクティブスキルの所属カテゴリを初期展開。
  const activeCat = SKILL_MAP[tab]?.category;
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(activeCat ? [activeCat] : ["language"]),
  );
  useEffect(() => {
    if (activeCat) setOpen((s) => (s.has(activeCat) ? s : new Set(s).add(activeCat)));
  }, [activeCat]);

  const toggle = (id: string) => setOpen((s) => toggleInSet(s, id));

  const navSkill = (id: string, name: string, icon: string) => (
    <button key={id} className={navItemCls(tab === id, true)} onClick={() => setTab(id)}>
      <Icon name={icon} size={16} />
      <span>{name}</span>
      {id === mainLang ? (
        <span title="得意言語" className="text-[#ffce54]">
          ★
        </span>
      ) : interestLangs.includes(id) ? (
        <span title="興味あり" className="text-accent2">
          ●
        </span>
      ) : null}
      <span className="ml-auto text-[11px] text-muted">{levelForXp(skills[id]?.xp ?? 0)}</span>
    </button>
  );

  return (
    <div className="overflow-y-auto border-r border-border bg-panel p-2.5">
      <StatusBlock />

      <div className={NAV_SECTION}>メニュー</div>
      {MENU.map(([id, icon, label]) => (
        <button key={id} className={navItemCls(tab === id)} onClick={() => setTab(id)}>
          <Icon name={icon} />
          <span>{label}</span>
        </button>
      ))}

      <div className={NAV_SECTION}>スキル</div>
      {CATEGORIES.map((cat) => {
        const list = SKILLS_BY_CATEGORY[cat.id] ?? [];
        if (list.length === 0) return null;
        const expanded = open.has(cat.id);
        return (
          <div key={cat.id}>
            <button
              className="mb-0.5 flex w-full items-center gap-[7px] rounded-md border border-transparent bg-transparent px-1.5 py-1.5 text-left text-xs text-text hover:bg-panel2"
              onClick={() => toggle(cat.id)}
            >
              <Icon name={expanded ? "chevronDown" : "chevronRight"} size={13} />
              <Icon name={cat.icon} size={14} />
              <span>{cat.name}</span>
              <span className="ml-auto rounded-[10px] border border-border bg-panel px-1.5 text-[10px] text-muted">
                {list.length}
              </span>
            </button>
            {expanded && list.map((s) => navSkill(s.id, s.name, s.icon))}
          </div>
        );
      })}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useGame } from "../game/store";
import { CATEGORIES, SKILL_MAP, SKILLS_BY_CATEGORY, CLASS_MAP, COMBAT_STAT_IDS } from "../game/data";
import { levelForXp } from "../game/xp";
import { currentRank } from "../game/rank";
import { getCombatStats } from "../game/combat";
import { Icon } from "../ui/icons";
import { Bar } from "./Bar";
import { formatNumber } from "../ui/format";

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
    <div className="status">
      <div className="srow">
        <span className="sname">{rank.name}</span>
        <span className="sgold">¥{formatNumber(state.gold)}</span>
      </div>
      <div className="srow" style={{ color: "var(--muted)" }}>
        <span>{className}</span>
        <span>Eng Lv {engLevel}</span>
      </div>
      <Bar
        kind="hp"
        value={state.playerHp / stats.maxHp}
        right={`${Math.ceil(state.playerHp)}/${stats.maxHp}`}
        label="メンタル"
      />
      <div className="sstats">
        <span><Icon name="impl" size={11} /> 実装 {stats.maxHit}</span>
        <span><Icon name="debug" size={11} /> 精度 {stats.attackRating}</span>
        <span><Icon name="robust" size={11} /> 堅牢 {stats.defenceRating}</span>
      </div>
    </div>
  );
}

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
    if (activeCat)
      setOpen((s) => (s.has(activeCat) ? s : new Set(s).add(activeCat)));
  }, [activeCat]);

  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const navSkill = (id: string, name: string, icon: string) => (
    <button
      key={id}
      className={`nav-item sub ${tab === id ? "selected" : ""}`}
      onClick={() => setTab(id)}
    >
      <Icon name={icon} size={16} />
      <span>{name}</span>
      {id === mainLang ? (
        <span title="得意言語" style={{ color: "#ffce54" }}>★</span>
      ) : interestLangs.includes(id) ? (
        <span title="興味あり" style={{ color: "#6ee7a8" }}>●</span>
      ) : null}
      <span className="lvl">{levelForXp(skills[id]?.xp ?? 0)}</span>
    </button>
  );

  return (
    <div className="sidebar">
      <StatusBlock />

      <div className="nav-section">メニュー</div>
      {MENU.map(([id, icon, label]) => (
        <button
          key={id}
          className={`nav-item ${tab === id ? "selected" : ""}`}
          onClick={() => setTab(id)}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </button>
      ))}

      <div className="nav-section">スキル</div>
      {CATEGORIES.map((cat) => {
        const list = SKILLS_BY_CATEGORY[cat.id] ?? [];
        if (list.length === 0) return null;
        const expanded = open.has(cat.id);
        return (
          <div key={cat.id}>
            <button className="nav-group" onClick={() => toggle(cat.id)}>
              <Icon name={expanded ? "chevronDown" : "chevronRight"} size={13} />
              <Icon name={cat.icon} size={14} />
              <span>{cat.name}</span>
              <span className="cnt">{list.length}</span>
            </button>
            {expanded && list.map((s) => navSkill(s.id, s.name, s.icon))}
          </div>
        );
      })}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useGame } from "../game/store";
import { GROUPS, SKILL_MAP, SKILLS, SKILLS_BY_GROUP } from "../game/data";
import { levelForXp } from "../game/xp";
import { Icon } from "../ui/icons";

export type Tab = string;

interface SidebarProps {
  tab: Tab;
  setTab: (t: Tab) => void;
}

export function Sidebar({ tab, setTab }: SidebarProps) {
  const skills = useGame((s) => s.skills);
  const combatStats = SKILLS.filter((s) => s.kind === "combat");
  const craftSkills = SKILLS.filter((s) => s.kind === "craft");

  // 折りたたみ状態。初期はアクティブなスキルのグループだけ開く。
  const activeGroup = SKILL_MAP[tab]?.group;
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(activeGroup ? [activeGroup] : ["g_script"]),
  );
  // タブ変更時、その所属グループは開いておく。
  useEffect(() => {
    if (activeGroup) setOpen((s) => (s.has(activeGroup) ? s : new Set(s).add(activeGroup)));
  }, [activeGroup]);

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
      <span className="lvl">{levelForXp(skills[id]?.xp ?? 0)}</span>
    </button>
  );

  const renderGroup = (g: (typeof GROUPS)[number]) => {
    const list = SKILLS_BY_GROUP[g.id] ?? [];
    const expanded = open.has(g.id);
    return (
      <div key={g.id}>
        <button className="nav-group" onClick={() => toggle(g.id)}>
          <Icon name={expanded ? "chevronDown" : "chevronRight"} size={13} />
          <Icon name={g.icon} size={14} />
          <span>{g.name}</span>
          <span className="cnt">{list.length}</span>
        </button>
        {expanded && list.map((s) => navSkill(s.id, s.name, s.icon))}
      </div>
    );
  };

  return (
    <div className="sidebar">
      <div className="nav-section">言語スタック</div>
      {GROUPS.map(renderGroup)}

      <div className="nav-section">クラフト</div>
      {craftSkills.map((s) => navSkill(s.id, s.name, s.icon))}

      <div className="nav-section">現場力</div>
      <button
        className={`nav-item ${tab === "combat" ? "selected" : ""}`}
        onClick={() => setTab("combat")}
      >
        <Icon name="projects" />
        <span>案件</span>
      </button>
      {combatStats.map((s) => (
        <div key={s.id} className="nav-item" style={{ cursor: "default" }}>
          <Icon name={s.icon} />
          <span>{s.name}</span>
          <span className="lvl">{levelForXp(skills[s.id]?.xp ?? 0)}</span>
        </div>
      ))}

      <div className="nav-section">その他</div>
      {(
        [
          ["career", "career", "キャリア"],
          ["equip", "company", "装備"],
          ["prestige", "prestige", "起業"],
          ["bank", "bank", "成果物"],
          ["shop", "shop", "購買"],
        ] as const
      ).map(([id, icon, label]) => (
        <button
          key={id}
          className={`nav-item ${tab === id ? "selected" : ""}`}
          onClick={() => setTab(id)}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

import { useGame } from "../game/store";
import { DOMAINS, SKILLS, SKILLS_BY_DOMAIN } from "../game/data";
import { levelForXp } from "../game/xp";
import { Icon } from "../ui/icons";

export type Tab = string; // skillId | "combat" | "career" | "team" | "prestige" | "bank" | "shop"

interface SidebarProps {
  tab: Tab;
  setTab: (t: Tab) => void;
}

export function Sidebar({ tab, setTab }: SidebarProps) {
  const skills = useGame((s) => s.skills);
  const combatStats = SKILLS.filter((s) => s.kind === "combat");

  const navSkill = (id: string, name: string, icon: string) => (
    <button
      key={id}
      className={`nav-item ${tab === id ? "selected" : ""}`}
      onClick={() => setTab(id)}
    >
      <Icon name={icon} />
      <span>{name}</span>
      <span className="lvl">Lv {levelForXp(skills[id]?.xp ?? 0)}</span>
    </button>
  );

  return (
    <div className="sidebar">
      {/* 分野ごとに 言語 → フレームワーク */}
      {DOMAINS.map((d) => (
        <div key={d.id}>
          <div className="nav-group-title">
            <Icon name={d.icon} size={13} /> {d.name}
          </div>
          {SKILLS_BY_DOMAIN[d.id]?.map((s) => navSkill(s.id, s.name, s.icon))}
        </div>
      ))}

      <div className="nav-group-title">現場力</div>
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
          <span className="lvl">Lv {levelForXp(skills[s.id]?.xp ?? 0)}</span>
        </div>
      ))}

      <div className="nav-group-title">その他</div>
      {(
        [
          ["career", "career", "キャリア"],
          ["team", "team", "チーム"],
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

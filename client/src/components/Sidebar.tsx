import { useGame } from "../game/store";
import { SKILLS } from "../game/data";
import { levelForXp } from "../game/xp";

export type Tab = string; // skillId | "combat" | "bank" | "shop"

interface SidebarProps {
  tab: Tab;
  setTab: (t: Tab) => void;
}

export function Sidebar({ tab, setTab }: SidebarProps) {
  const skills = useGame((s) => s.skills);
  const gather = SKILLS.filter((s) => s.kind === "gather");
  const craft = SKILLS.filter((s) => s.kind === "craft");
  const combat = SKILLS.filter((s) => s.kind === "combat");

  const navSkill = (id: string, name: string, icon: string) => (
    <button
      key={id}
      className={`nav-item ${tab === id ? "selected" : ""}`}
      onClick={() => setTab(id)}
    >
      <span className="ic">{icon}</span>
      <span>{name}</span>
      <span className="lvl">Lv {levelForXp(skills[id]?.xp ?? 0)}</span>
    </button>
  );

  return (
    <div className="sidebar">
      <div className="nav-group-title">Gathering</div>
      {gather.map((s) => navSkill(s.id, s.name, s.icon))}

      <div className="nav-group-title">Crafting</div>
      {craft.map((s) => navSkill(s.id, s.name, s.icon))}

      <div className="nav-group-title">Combat</div>
      <button
        className={`nav-item ${tab === "combat" ? "selected" : ""}`}
        onClick={() => setTab("combat")}
      >
        <span className="ic">🗡️</span>
        <span>Fight</span>
      </button>
      {combat.map((s) => (
        <div key={s.id} className="nav-item" style={{ cursor: "default" }}>
          <span className="ic">{s.icon}</span>
          <span>{s.name}</span>
          <span className="lvl">Lv {levelForXp(skills[s.id]?.xp ?? 0)}</span>
        </div>
      ))}

      <div className="nav-group-title">Other</div>
      <button
        className={`nav-item ${tab === "bank" ? "selected" : ""}`}
        onClick={() => setTab("bank")}
      >
        <span className="ic">🎒</span>
        <span>Bank</span>
      </button>
      <button
        className={`nav-item ${tab === "shop" ? "selected" : ""}`}
        onClick={() => setTab("shop")}
      >
        <span className="ic">🏪</span>
        <span>Shop</span>
      </button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useGame } from "./game/store";
import { SKILL_MAP } from "./game/data";
import { TopBar } from "./components/TopBar";
import { Sidebar, type Tab } from "./components/Sidebar";
import { SkillView } from "./components/SkillView";
import { CombatView } from "./components/CombatView";
import { BankView } from "./components/BankView";
import { ShopView } from "./components/ShopView";
import { CareerView } from "./components/CareerView";
import { TeamView } from "./components/TeamView";
import { PrestigeView } from "./components/PrestigeView";
import { LogPanel } from "./components/LogPanel";
import { OfflineModal } from "./components/OfflineModal";

export default function App() {
  const init = useGame((s) => s.init);
  const ready = useGame((s) => s.ready);
  const [tab, setTab] = useState<Tab>("js");

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <div className="muted">セーブを読み込み中…</div>
      </div>
    );
  }

  let main;
  if (tab === "combat") main = <CombatView />;
  else if (tab === "career") main = <CareerView />;
  else if (tab === "team") main = <TeamView />;
  else if (tab === "prestige") main = <PrestigeView />;
  else if (tab === "bank") main = <BankView />;
  else if (tab === "shop") main = <ShopView />;
  else if (SKILL_MAP[tab]) main = <SkillView skillId={tab} />;
  else main = <CombatView />;

  return (
    <div className="app">
      <TopBar />
      <div className="body">
        <Sidebar tab={tab} setTab={setTab} />
        <div className="main">{main}</div>
        <div className="rightbar">
          <LogPanel />
        </div>
      </div>
      <OfflineModal />
    </div>
  );
}

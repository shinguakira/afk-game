import { useEffect, useState } from "react";
import { useGame } from "./game/store";
import { SKILL_MAP } from "./game/data";
import { TopBar } from "./components/TopBar";
import { Sidebar, type Tab } from "./components/Sidebar";
import { SkillView } from "./components/SkillView";
import { CombatView } from "./components/CombatView";
import { BankView } from "./components/BankView";
import { ShopView } from "./components/ShopView";
import { FarmingView } from "./components/FarmingView";
import { CareerView } from "./components/CareerView";
import { PrestigeView } from "./components/PrestigeView";
import { EquipView } from "./components/EquipView";
import { RoadmapView } from "./components/RoadmapView";
import { ToastHost } from "./components/ToastHost";
import { LogPanel } from "./components/LogPanel";
import { OfflineModal } from "./components/OfflineModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { TutorialOverlay } from "./components/TutorialOverlay";
import { TUTORIAL_STEPS } from "./game/data/tutorial";

export default function App() {
  const init = useGame((s) => s.init);
  const ready = useGame((s) => s.ready);
  const onboarded = useGame((s) => s.onboarded);
  const tutorialStep = useGame((s) => s.tutorialStep);
  const mainLang = useGame((s) => s.mainLang);
  const [tab, setTab] = useState<Tab>("js");

  useEffect(() => {
    void init();
  }, [init]);

  // チュートリアル: ステップに応じて実際の画面へ切り替える（"@main" = 得意言語）。
  useEffect(() => {
    if (tutorialStep < 0 || tutorialStep >= TUTORIAL_STEPS.length) return;
    const t = TUTORIAL_STEPS[tutorialStep].tab;
    setTab(t === "@main" ? mainLang ?? "js" : t);
  }, [tutorialStep, mainLang]);

  if (!ready) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <div className="muted">セーブを読み込み中…</div>
      </div>
    );
  }

  let main;
  if (tab === "combat") main = <CombatView />;
  else if (tab === "roadmap") main = <RoadmapView />;
  else if (tab === "career") main = <CareerView />;
  else if (tab === "equip") main = <EquipView />;
  else if (tab === "prestige") main = <PrestigeView />;
  else if (tab === "bank") main = <BankView />;
  else if (tab === "shop") main = <ShopView />;
  else if (tab === "farming") main = <FarmingView />;
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
      <ToastHost />
      {ready && !onboarded && <OnboardingModal />}
      <TutorialOverlay />
    </div>
  );
}

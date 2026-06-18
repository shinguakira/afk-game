import { useGame } from "../game/store";
import { SKILL_MAP } from "../game/data";
import { TUTORIAL_STEPS } from "../game/data/tutorial";
import { Icon } from "../ui/icons";

export function TutorialOverlay() {
  const step = useGame((s) => s.tutorialStep);
  const name = useGame((s) => s.playerName);
  const mainLang = useGame((s) => s.mainLang);
  const setStep = useGame((s) => s.setTutorialStep);
  const end = useGame((s) => s.endTutorial);

  if (step < 0 || step >= TUTORIAL_STEPS.length) return null;
  const s = TUTORIAL_STEPS[step];
  const langName = (mainLang && SKILL_MAP[mainLang]?.name) || "言語";
  const sub = (t: string) =>
    t.replace(/\{name\}/g, name || "あなた").replace(/\{lang\}/g, langName);

  const last = step === TUTORIAL_STEPS.length - 1;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 18,
        transform: "translateX(-50%)",
        zIndex: 2000,
        width: "min(540px, 94vw)",
        background: "var(--panel, #161b22)",
        border: "1.5px solid #6ee7a8",
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Icon name="roadmap" size={18} />
        <strong style={{ fontSize: 15 }}>{sub(s.title)}</strong>
        <span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>
          {step + 1} / {TUTORIAL_STEPS.length}
        </span>
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.6 }}>{sub(s.body)}</p>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={end} style={{ fontSize: 12 }}>
          スキップ
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {step > 0 && <button onClick={() => setStep(step - 1)}>戻る</button>}
          <button className="primary" onClick={() => (last ? end() : setStep(step + 1))}>
            {last ? "はじめる" : "次へ"}
          </button>
        </div>
      </div>
    </div>
  );
}

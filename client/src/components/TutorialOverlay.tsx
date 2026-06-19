import { useGame } from "@/store";
import { SKILL_MAP } from "@/constants/maps";
import { TUTORIAL_STEPS } from "@/constants/tutorial";
import { Icon } from "@/components/icons";

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
    <div className="fixed bottom-[18px] left-1/2 z-[2000] w-[min(540px,94vw)] -translate-x-1/2 rounded-xl border-[1.5px] border-accent2 bg-panel px-4 py-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      <div className="mb-1.5 flex items-center gap-2">
        <Icon name="roadmap" size={18} />
        <strong className="text-[15px]">{sub(s.title)}</strong>
        <span className="ml-auto text-xs text-muted">
          {step + 1} / {TUTORIAL_STEPS.length}
        </span>
      </div>
      <p className="mb-3 text-[13.5px] leading-relaxed">{sub(s.body)}</p>
      <div className="flex items-center gap-2">
        <button onClick={end} className="text-xs">
          スキップ
        </button>
        <div className="ml-auto flex gap-2">
          {step > 0 && <button onClick={() => setStep(step - 1)}>戻る</button>}
          <button
            className="border-accent bg-accent font-semibold text-[#06101f]"
            onClick={() => (last ? end() : setStep(step + 1))}
          >
            {last ? "はじめる" : "次へ"}
          </button>
        </div>
      </div>
    </div>
  );
}

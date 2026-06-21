import { useState } from "react";
import { useGame } from "@/store";
import { SKILLS_BY_CATEGORY } from "@/constants/maps";
import { Icon } from "@/components/icons";

const LANGS = SKILLS_BY_CATEGORY["language"] ?? [];

function LangGrid({
  selected,
  onToggle,
  multi,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
  multi: boolean;
}) {
  return (
    <div className="grid max-h-[46vh] grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2 overflow-y-auto pr-1">
      {LANGS.map((l) => {
        const on = selected.has(l.id);
        return (
          <button
            key={l.id}
            onClick={() => onToggle(l.id)}
            aria-pressed={on}
            className={`flex cursor-pointer flex-col items-center gap-[5px] rounded-lg border-[1.5px] px-1.5 py-2.5 ${on ? "border-accent2 bg-[#1d2b22]" : "border-border bg-panel"}`}
          >
            <Icon name={l.icon} size={26} />
            <span className="text-[12.5px] font-semibold">{l.name}</span>
            {multi && on && <span className="text-[10px] text-accent2">選択中</span>}
          </button>
        );
      })}
    </div>
  );
}

export function OnboardingModal() {
  const complete = useGame((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [main, setMain] = useState<string | null>(null);
  const [interest, setInterest] = useState<Set<string>>(new Set());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[min(620px,94vw)] rounded-[14px] border border-border bg-panel p-6">
        {step === 0 && (
          <>
            <h2 className="mb-1.5">ようこそ AFK Engineer へ</h2>
            <p className="mt-0 text-muted">
              無名のコーダーが、技術を極め・金を稼ぎ、起業して伝説になる放置RPG。
              まずはあなたのことを教えてください。
            </p>
            <label className="mb-1.5 block text-[13px]">エンジニア名</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: あきら"
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === "Enter") setStep(1);
              }}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-[15px] text-inherit"
            />
            <div className="mt-4 flex justify-end">
              <button
                className="border-accent bg-accent font-semibold text-[#06101f]"
                onClick={() => setStep(1)}
              >
                次へ
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="mb-1.5">得意な言語は?</h2>
            <p className="mt-0 text-muted">
              1つ選んでください。<strong>開始時にレベルが入り</strong>
              、チュートリアルもこの言語で進めます。
            </p>
            <LangGrid
              selected={new Set(main ? [main] : [])}
              onToggle={(id) => setMain(id)}
              multi={false}
            />
            <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(0)}>戻る</button>
              <button
                className="border-accent bg-accent font-semibold text-[#06101f]"
                disabled={!main}
                onClick={() => setStep(2)}
              >
                次へ
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="mb-1.5">
              興味のある言語は?
              <span className="ml-2 text-sm font-normal text-muted">
                {interest.size}/3
              </span>
            </h2>
            <p className="mt-0 text-muted">
              最大3つ選択。XP +10% ブーストが入り、サイドバーで目印が付きます。スキップも可。
            </p>
            <LangGrid
              selected={interest}
              onToggle={(id) =>
                setInterest((prev) => {
                  if (prev.has(id)) {
                    const n = new Set(prev);
                    n.delete(id);
                    return n;
                  }
                  if (prev.size >= 3) return prev;
                  const n = new Set(prev);
                  n.add(id);
                  return n;
                })
              }
              multi
            />
            <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(1)}>戻る</button>
              <button
                className="border-accent bg-accent font-semibold text-[#06101f]"
                onClick={() => complete(name, main!, [...interest])}
              >
                はじめる
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useGame } from "../game/store";
import { SKILLS_BY_CATEGORY } from "../game/data";
import { toggleInSet } from "../game/util";
import { Icon } from "../ui/icons";

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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
        gap: 8,
        maxHeight: "46vh",
        overflowY: "auto",
        paddingRight: 4,
      }}
    >
      {LANGS.map((l) => {
        const on = selected.has(l.id);
        return (
          <button
            key={l.id}
            onClick={() => onToggle(l.id)}
            aria-pressed={on}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              padding: "10px 6px",
              background: on ? "var(--accent-bg, #1d2b22)" : "var(--panel, #1b2129)",
              border: `1.5px solid ${on ? "#6ee7a8" : "var(--border, #2a323c)"}`,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <Icon name={l.icon} size={26} />
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{l.name}</span>
            {multi && on && <span style={{ fontSize: 10, color: "#6ee7a8" }}>選択中</span>}
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
    <div className="modal-backdrop">
      <div className="modal" style={{ width: "min(620px, 94vw)" }}>
        {step === 0 && (
          <>
            <h2 style={{ margin: "0 0 6px" }}>ようこそ Idle Engineer へ</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              無名のコーダーが、技術を極め・金を稼ぎ、起業して伝説になる放置RPG。
              まずはあなたのことを教えてください。
            </p>
            <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>エンジニア名</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: あきら"
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === "Enter") setStep(1);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 15,
                background: "var(--panel, #1b2129)",
                color: "inherit",
                border: "1px solid var(--border, #2a323c)",
                borderRadius: 8,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button className="primary" onClick={() => setStep(1)}>
                次へ
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ margin: "0 0 6px" }}>得意な言語は?</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              1つ選んでください。<strong>開始時にレベルが入り</strong>
              、チュートリアルもこの言語で進めます。
            </p>
            <LangGrid
              selected={new Set(main ? [main] : [])}
              onToggle={(id) => setMain(id)}
              multi={false}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setStep(0)}>戻る</button>
              <button className="primary" disabled={!main} onClick={() => setStep(2)}>
                次へ
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ margin: "0 0 6px" }}>興味のある言語は?（複数可）</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              これから伸ばしたい言語を選択。少しブーストが入り、サイドバーで目印が付きます。スキップも可。
            </p>
            <LangGrid
              selected={interest}
              onToggle={(id) => setInterest((s) => toggleInSet(s, id))}
              multi
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setStep(1)}>戻る</button>
              <button className="primary" onClick={() => complete(name, main!, [...interest])}>
                はじめる
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

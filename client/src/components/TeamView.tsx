import { useGame } from "../game/store";
import { ACTIONS, SKILL_MAP, SKILLS } from "../game/data";
import { currentRank, maxSubordinates } from "../game/rank";
import { hireCost } from "../game/team";
import { levelForXp, levelProgress } from "../game/xp";
import { formatNumber } from "../ui/format";
import { Bar } from "./Bar";
import { Icon } from "../ui/icons";

// 部下に割り当てられるのは生産系アクション。言語は 基礎/ライブラリ/フレームワーク、
// クラフトスキル(料理/PC組み立て)は全アクション。スキルごとに optgroup でまとめる。
const PROD_CATEGORIES = new Set(["base", "library", "framework"]);
const ASSIGNABLE_BY_SKILL = SKILLS.filter(
  (s) => s.kind === "gather" || s.kind === "craft",
)
  .map((s) => ({
    skill: s,
    actions: ACTIONS.filter(
      (a) =>
        a.skill === s.id &&
        (s.kind === "craft" || PROD_CATEGORIES.has(a.category ?? "base")),
    ),
  }))
  .filter((g) => g.actions.length > 0);

export function TeamView() {
  const state = useGame();
  const rank = currentRank(state);
  const cap = maxSubordinates(rank.index);
  const subs = state.subordinates;
  const nextCost = hireCost(subs.length);
  const canHire = subs.length < cap && state.gold >= nextCost;

  return (
    <div>
      <h2 className="section-title">
        <Icon name="team" size={22} /> チーム
      </h2>
      <p className="section-sub">
        部下はあなたとは別に生産/制作を1つ並行で回します。放置中も働きます。
      </p>

      <div className="card" style={{ marginBottom: 16, maxWidth: 460 }}>
        <div className="row-between">
          <div>
            採用枠 <strong>{subs.length} / {cap}</strong>
            {cap === 0 && (
              <span className="muted"> （ミドル昇進で解禁）</span>
            )}
          </div>
          <button
            className="primary"
            disabled={!canHire}
            onClick={() => state.hireSubordinate()}
          >
            {subs.length >= cap ? "枠が一杯" : `採用 ¥${formatNumber(nextCost)}`}
          </button>
        </div>
      </div>

      {subs.length === 0 && (
        <p className="muted">
          まだ部下がいません。{cap === 0 ? "まず昇進しましょう。" : "採用してみましょう。"}
        </p>
      )}

      <div className="grid">
        {subs.map((sub) => {
          const lvl = levelForXp(sub.xp);
          return (
            <div className="card" key={sub.id}>
              <div className="row-between">
                <h3 style={{ margin: 0 }}>
                  <Icon name="team" size={16} /> {sub.name}
                </h3>
                <span className="muted">Lv {lvl}</span>
              </div>
              <div style={{ margin: "8px 0" }}>
                <Bar kind="xp" value={levelProgress(sub.xp)} />
              </div>

              <div style={{ fontSize: 12, marginBottom: 8 }}>
                <span className="muted">担当: </span>
                <select
                  value={sub.assignment ?? ""}
                  onChange={(e) =>
                    state.assignSubordinate(sub.id, e.target.value || null)
                  }
                  style={{
                    background: "var(--panel)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "4px 6px",
                    maxWidth: "100%",
                  }}
                >
                  <option value="">— 待機 —</option>
                  {ASSIGNABLE_BY_SKILL.map(({ skill, actions }) => (
                    <optgroup key={skill.id} label={skill.name}>
                      {actions.map((a) => {
                        const locked = lvl < a.level;
                        return (
                          <option key={a.id} value={a.id} disabled={locked}>
                            {a.name}
                            {locked ? `（Lv${a.level}必要）` : ""}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>

              <button
                style={{ width: "100%" }}
                className="danger"
                onClick={() => {
                  if (confirm(`${sub.name} を解雇しますか？`))
                    state.fireSubordinate(sub.id);
                }}
              >
                解雇
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

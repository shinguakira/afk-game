import { useState } from "react";
import { useGame } from "../game/store";
import { ITEM_MAP, ACTIONS_BY_SKILL } from "../game/data";
import { FARM_CROPS, FARM_CROP_MAP } from "../game/data/farming";
import { levelForXp, levelProgress, MAX_LEVEL, xpForLevel } from "../game/xp";
import { formatNumber } from "../ui/format";
import { Bar } from "./Bar";
import { TimerBar } from "./TimerBar";
import { Icon } from "../ui/icons";

function fmtTime(ms: number): string {
  const sec = Math.ceil(ms / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function CropPicker({
  plotIndex,
  farmLevel,
  onClose,
}: {
  plotIndex: number;
  farmLevel: number;
  onClose: () => void;
}) {
  const plant = useGame((s) => s.plantCrop);
  const bank = useGame((s) => s.bank);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>植える作物を選ぶ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FARM_CROPS.map((c) => {
            const it = ITEM_MAP[c.id];
            const seedIt = c.seed ? ITEM_MAP[c.seed] : null;
            const owned = c.seed ? bank[c.seed] ?? 0 : 0;
            const lockedLv = farmLevel < c.level;
            const noSeed = !!c.seed && owned < 1;
            const disabled = lockedLv || noSeed;
            return (
              <button
                key={c.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 10,
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--panel, #1b2129)",
                  border: "1px solid var(--border, #2a323c)",
                  borderRadius: 8,
                  opacity: disabled ? 0.5 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
                disabled={disabled}
                onClick={() => {
                  plant(plotIndex, c.id);
                  onClose();
                }}
              >
                <Icon name={it?.icon} size={30} />
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{it?.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    <Icon name="till" size={11} /> 育成 {fmtTime(c.growMs)} ・ 収穫 ×{c.yield}
                  </div>
                </div>
                <div className="muted" style={{ fontSize: 12, textAlign: "right", whiteSpace: "nowrap" }}>
                  {lockedLv ? (
                    <span style={{ color: "var(--danger)" }}>Lv {c.level} 必要</span>
                  ) : c.seed ? (
                    <span style={{ color: noSeed ? "var(--danger)" : undefined }}>
                      {seedIt?.name} {owned}
                    </span>
                  ) : (
                    <span style={{ color: "var(--accent, #6ee7a8)" }}>種不要</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <button style={{ width: "100%", marginTop: 14 }} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}

export function FarmingView() {
  const state = useGame();
  const xp = state.skills.farming?.xp ?? 0;
  const level = levelForXp(xp);
  const [planting, setPlanting] = useState<number | null>(null);

  const tendActions = ACTIONS_BY_SKILL["farming"] ?? [];
  const active = state.active;
  const tending =
    active?.kind === "skill" && tendActions.some((a) => a.id === active.actionId);

  return (
    <div>
      <h2 className="section-title">
        <Icon name="farming" size={22} /> 農業
      </h2>
      <p className="section-sub">
        作物は<strong>畑で放置成長</strong>。土を整える・水やり・肥料をまく＝
        <strong>手入れ（能動）</strong>で farming 経験値が入り、手入れ中は全畑の成長が加速。
      </p>

      <div style={{ maxWidth: 420, marginBottom: 18 }}>
        <Bar
          kind="xp"
          value={levelProgress(xp)}
          label={`Lv ${level}`}
          right={
            level >= MAX_LEVEL
              ? `${formatNumber(xp)} xp (max)`
              : `${formatNumber(xp)} / ${formatNumber(xpForLevel(level + 1))} xp`
          }
        />
      </div>

      <h3 style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 10px" }}>
        <Icon name="farming" size={16} /> 畑{tending && <span className="tag">手入れ中 ×2.5</span>}
      </h3>
      <div className="grid" style={{ marginBottom: 22 }}>
        {state.plots.map((p, i) => {
          if (!p.crop) {
            return (
              <div key={i} className="card">
                <h3 style={{ color: "var(--muted)" }}>空き畑</h3>
                <button
                  className="primary"
                  style={{ width: "100%", marginTop: 8 }}
                  onClick={() => setPlanting(i)}
                >
                  植える
                </button>
              </div>
            );
          }
          const spec = FARM_CROP_MAP[p.crop];
          const it = ITEM_MAP[p.crop];
          const ready = p.growth >= spec.growMs;
          return (
            <div key={i} className={`card ${ready ? "selected" : ""}`}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name={it?.icon} size={18} /> {it?.name}
              </h3>
              <div className="meta">
                {ready ? "収穫できます" : `あと ${fmtTime(spec.growMs - p.growth)}`} ・ ×{spec.yield}
              </div>
              <Bar kind="xp" value={Math.min(1, p.growth / spec.growMs)} />
              {ready ? (
                <button
                  className="primary"
                  style={{ width: "100%", marginTop: 8 }}
                  onClick={() => state.harvestPlot(i)}
                >
                  収穫
                </button>
              ) : (
                <button style={{ width: "100%", marginTop: 8 }} disabled>
                  生育中…
                </button>
              )}
            </div>
          );
        })}
      </div>

      <h3 style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 10px" }}>
        <Icon name="till" size={16} /> 手入れ（能動・経験値＋成長加速）
      </h3>
      <div className="grid">
        {tendActions.map((a) => {
          const unlocked = level >= a.level;
          const isActive =
            state.active?.kind === "skill" && state.active.actionId === a.id;
          return (
            <div key={a.id} className={`card ${!unlocked ? "locked" : ""} ${isActive ? "selected" : ""}`}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name={a.icon} size={16} /> {a.name}
              </h3>
              <div className="meta">
                {!unlocked && <span style={{ color: "var(--danger)" }}>Lv {a.level} 必要 · </span>}
                {(a.time / 1000).toFixed(1)}s · {a.xp} xp
              </div>
              {isActive ? (
                <>
                  <TimerBar periodMs={a.time} running />
                  <button
                    className="danger"
                    style={{ width: "100%", marginTop: 8 }}
                    onClick={() => state.stop()}
                  >
                    中断
                  </button>
                </>
              ) : (
                <button
                  className="primary"
                  style={{ width: "100%", marginTop: 8 }}
                  disabled={!unlocked}
                  onClick={() => state.startAction(a.id)}
                >
                  {unlocked ? "開始" : `Lv ${a.level} で解禁`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {planting !== null && (
        <CropPicker
          plotIndex={planting}
          farmLevel={level}
          onClose={() => setPlanting(null)}
        />
      )}
    </div>
  );
}

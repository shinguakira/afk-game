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
  if (sec < 60) return `${sec}秒`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}時間${m}分` : `${h}時間`;
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

  // 植えられるもの（Lv充足＋種あり/種不要）を先頭に、次にLv順。数が増えても上に使える作物が並ぶ。
  const rows = FARM_CROPS.map((c) => {
    const owned = c.seed ? bank[c.seed] ?? 0 : 0;
    const lockedLv = farmLevel < c.level;
    const noSeed = !!c.seed && owned < 1;
    return { c, owned, lockedLv, noSeed, plantable: !lockedLv && !noSeed };
  }).sort((a, b) =>
    Number(b.plantable) - Number(a.plantable) || a.c.level - b.c.level,
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(580px, 94vw)" }}
      >
        <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>植える作物</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(116px, 1fr))",
            gap: 8,
            maxHeight: "58vh",
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {rows.map(({ c, owned, lockedLv, noSeed, plantable }) => {
            const it = ITEM_MAP[c.id];
            return (
              <button
                key={c.id}
                disabled={!plantable}
                onClick={() => {
                  plant(plotIndex, c.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "10px 6px 8px",
                  background: "var(--panel, #1b2129)",
                  border: `1px solid ${plantable ? "var(--border, #2a323c)" : "transparent"}`,
                  borderRadius: 8,
                  opacity: plantable ? 1 : 0.5,
                  cursor: plantable ? "pointer" : "not-allowed",
                }}
              >
                <Icon name={it?.icon} size={34} />
                <div style={{ fontWeight: 600, fontSize: 12.5, textAlign: "center" }}>
                  {it?.name}
                </div>
                <div className="muted" style={{ fontSize: 11 }}>
                  {fmtTime(c.growMs)} ・ ×{c.yield}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>
                  {lockedLv ? (
                    <span style={{ color: "var(--danger, #e05656)" }}>Lv {c.level} 必要</span>
                  ) : !c.seed ? (
                    <span style={{ color: "#6ee7a8" }}>種不要</span>
                  ) : (
                    <span style={{ color: noSeed ? "var(--danger, #e05656)" : "var(--muted)" }}>
                      種 {owned}
                    </span>
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

import { useGame } from "../game/store";
import { PRESTIGE_UPGRADES } from "../game/data";
import { prestigeGain, isUnderPrepared } from "../game/prestige";
import { formatNumber } from "../ui/format";
import { Icon } from "../ui/icons";

export function PrestigeView() {
  const state = useGame();
  const gain = prestigeGain(state);
  const underPrepared = isUnderPrepared(state);

  return (
    <div>
      <h2 className="section-title">
        <Icon name="prestige" size={22} /> 起業
      </h2>
      <p className="section-sub">
        独立して全てをリセットし、永続通貨「ストック」を獲得。経営ツリーで全実行が恒久的に強化されます（リセットしても残る）。
      </p>

      <div className="card" style={{ marginBottom: 16, maxWidth: 480 }}>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <span>
            所持ストック{" "}
            <strong style={{ color: "var(--gold)" }}>
              {formatNumber(state.prestigePoints)}
            </strong>
          </span>
          <span className="muted">通算起業 {state.prestigeCount} 回</span>
        </div>
        <div className="row-between" style={{ alignItems: "center" }}>
          <span className="muted">今起業すると ストック +{gain}</span>
          <button
            className="primary"
            onClick={() => {
              if (
                confirm(
                  `全進捗（スキル/成果物/職種）をリセットして起業し、ストックを ${gain} 獲得します。よろしいですか？`,
                )
              )
                state.prestige();
            }}
          >
            起業する
          </button>
        </div>
        {underPrepared && (
          <div className="muted" style={{ fontSize: 12, marginTop: 8, color: "var(--danger)" }}>
            注意: 準備不足での起業はストックが少なく、再スタートが厳しくなります（シニア以上推奨）。
          </div>
        )}
      </div>

      <h3 style={{ margin: "0 0 10px" }}>経営ツリー（永続強化）</h3>
      <div className="grid">
        {PRESTIGE_UPGRADES.map((up) => {
          const lvl = state.prestigeUpgrades[up.id] ?? 0;
          const maxed = lvl >= up.maxLevel;
          const cost = maxed ? 0 : up.cost(lvl + 1);
          const affordable = !maxed && state.prestigePoints >= cost;
          return (
            <div
              key={up.id}
              className={`card ${lvl > 0 ? "selected" : ""}`}
            >
              <div className="row-between">
                <h3 style={{ margin: 0 }}>
                  <Icon name={up.icon} size={18} /> {up.name}
                </h3>
                <span className="muted">
                  Lv {lvl}/{up.maxLevel}
                </span>
              </div>
              <div className="meta" style={{ marginTop: 4 }}>
                {up.desc}
              </div>
              <button
                className={affordable ? "primary" : ""}
                style={{ width: "100%" }}
                disabled={maxed || !affordable}
                onClick={() => state.buyPrestigeUpgrade(up.id)}
              >
                {maxed ? "MAX" : `取得 (ストック ${cost})`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

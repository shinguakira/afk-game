import { useGame } from "../store";
import { PRESTIGE_UPGRADES } from "../constants/prestige";
import { prestigeGain, isUnderPrepared } from "../lib/prestige";
import { formatNumber } from "../lib/format";
import { Icon } from "./icons";

export function PrestigeView() {
  const state = useGame();
  const gain = prestigeGain(state);
  const underPrepared = isUnderPrepared(state);

  return (
    <div>
      <h2 className="mb-1 flex items-center gap-2 text-lg">
        <Icon name="prestige" size={22} /> 起業
      </h2>
      <p className="mb-4 text-[13px] text-muted">
        独立して全てをリセットし、永続通貨「ストック」を獲得。経営ツリーで全実行が恒久的に強化されます（リセットしても残る）。
      </p>

      <div className="mb-4 max-w-[480px] rounded-[10px] border border-border bg-panel2 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span>
            所持ストック <strong className="text-gold">{formatNumber(state.prestigePoints)}</strong>
          </span>
          <span className="text-muted">通算起業 {state.prestigeCount} 回</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">今起業すると ストック +{gain}</span>
          <button
            className="border-accent bg-accent font-semibold text-[#06101f]"
            onClick={() => {
              if (
                confirm(
                  `全進捗（スキル/所持品/職種）をリセットして起業し、ストックを ${gain} 獲得します。よろしいですか？`,
                )
              )
                state.prestige();
            }}
          >
            起業する
          </button>
        </div>
        {underPrepared && (
          <div className="mt-2 text-xs text-danger">
            注意: 準備不足での起業はストックが少なく、再スタートが厳しくなります（シニア以上推奨）。
          </div>
        )}
      </div>

      <h3 className="mb-2.5">経営ツリー（永続強化）</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {PRESTIGE_UPGRADES.map((up) => {
          const lvl = state.prestigeUpgrades[up.id] ?? 0;
          const maxed = lvl >= up.maxLevel;
          const cost = maxed ? 0 : up.cost(lvl + 1);
          const affordable = !maxed && state.prestigePoints >= cost;
          return (
            <div
              key={up.id}
              className={`rounded-[10px] border bg-panel2 p-3 ${lvl > 0 ? "border-accent2" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <h3>
                  <Icon name={up.icon} size={18} /> {up.name}
                </h3>
                <span className="text-muted">
                  Lv {lvl}/{up.maxLevel}
                </span>
              </div>
              <div className="mt-1 mb-2 text-xs text-muted">{up.desc}</div>
              <button
                className={
                  affordable
                    ? "w-full border-accent bg-accent font-semibold text-[#06101f]"
                    : "w-full"
                }
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

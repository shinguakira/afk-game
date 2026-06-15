import { memo } from "react";

interface TimerBarProps {
  /** Loop duration in ms (e.g. action time or weapon speed). */
  periodMs: number;
  running: boolean;
  label?: string;
}

/**
 * A progress bar that fills 0→100% on a fixed loop using a pure CSS animation,
 * so it renders at 60fps independent of the game's 100ms logic tick (no stepping).
 *
 * Wrapped in memo() so the parent's 100ms re-renders don't reach it — otherwise
 * React re-touches the node every tick and restarts the CSS animation (it would
 * sit stuck at 0%). It only re-renders when periodMs/running/label actually change.
 */
export const TimerBar = memo(function TimerBar({
  periodMs,
  running,
  label,
}: TimerBarProps) {
  return (
    <div>
      {label && (
        <div className="bar-label">
          <span>{label}</span>
          <span />
        </div>
      )}
      <div className="bar action">
        <span
          className={running ? "timer" : ""}
          style={
            running
              ? { animationDuration: `${periodMs}ms` }
              : { transform: "scaleX(0)" }
          }
        />
      </div>
    </div>
  );
});

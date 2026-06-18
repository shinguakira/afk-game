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
export const TimerBar = memo(function TimerBar({ periodMs, running, label }: TimerBarProps) {
  return (
    <div>
      {label && (
        <div className="mb-[3px] flex justify-between text-[11px] text-muted">
          <span>{label}</span>
          <span />
        </div>
      )}
      <div className="relative h-2.5 overflow-hidden rounded-md border border-border bg-panel">
        <span
          className={`absolute inset-0 origin-left rounded-md bg-accent ${running ? "animate-bar-fill" : ""}`}
          style={running ? { animationDuration: `${periodMs}ms` } : { transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
});

interface BarProps {
  /** 0..1 */
  value: number;
  kind?: "xp" | "action" | "hp" | "enemy";
  label?: string;
  right?: string;
}

export function Bar({ value, kind = "action", label, right }: BarProps) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div>
      {(label || right) && (
        <div className="bar-label">
          <span>{label}</span>
          <span>{right}</span>
        </div>
      )}
      <div className={`bar ${kind}`}>
        <span style={{ transform: `scaleX(${pct})` }} />
      </div>
    </div>
  );
}

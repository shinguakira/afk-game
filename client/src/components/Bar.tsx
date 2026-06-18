interface BarProps {
  /** 0..1 */
  value: number;
  kind?: "xp" | "action" | "hp" | "enemy";
  label?: string;
  right?: string;
}

const FILL: Record<NonNullable<BarProps["kind"]>, string> = {
  xp: "bg-xp",
  action: "bg-accent",
  hp: "bg-hp",
  enemy: "bg-enemy",
};

export function Bar({ value, kind = "action", label, right }: BarProps) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div>
      {(label || right) && (
        <div className="mb-[3px] flex justify-between text-[11px] text-muted">
          <span>{label}</span>
          <span>{right}</span>
        </div>
      )}
      <div className="relative h-2.5 overflow-hidden rounded-md border border-border bg-panel">
        <span
          className={`absolute inset-0 origin-left rounded-md transition-transform duration-150 ease-linear ${FILL[kind]}`}
          style={{ transform: `scaleX(${pct})` }}
        />
      </div>
    </div>
  );
}

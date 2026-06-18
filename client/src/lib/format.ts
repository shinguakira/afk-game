export function formatNumber(n: number): string {
  const v = Math.floor(n);
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + "M";
  if (v >= 10_000) return (v / 1000).toFixed(1) + "k";
  return v.toLocaleString();
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (!h) parts.push(`${sec}s`);
  return parts.join(" ");
}

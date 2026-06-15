import type { Subordinate } from "./types";
import { ACTION_MAP } from "./data";
import { levelForXp } from "./xp";
import { type Effects, mult } from "./modifiers";

export const SUB_NAMES = [
  "新人 A",
  "新人 B",
  "佐藤",
  "田中",
  "鈴木",
  "高橋",
  "渡辺",
  "伊藤",
  "山本",
  "中村",
  "小林",
  "加藤",
];

/** n人目（0-indexed）の採用費。 */
export function hireCost(count: number): number {
  return 150 + count * 250;
}

/**
 * 部下の作業速度倍率。プレイヤーの職種速度補正は乗せず、
 * 部下自身の熟練度 + 部下効率補正(PM等)のみ。
 */
export function subSpeedMult(sub: Subordinate, eff: Effects): number {
  const lvl = levelForXp(sub.xp);
  return (1 + lvl * 0.005) * mult(eff, "subEfficiency");
}

/** 部下が割り当て中アクションを実行できるか（解禁レベル）。 */
export function canWork(sub: Subordinate): boolean {
  if (!sub.assignment) return false;
  const action = ACTION_MAP[sub.assignment];
  return !!action && levelForXp(sub.xp) >= action.level;
}

/**
 * 部下の並行作業を dt(ms) 進める。bank を共有で消費/産出。
 * 純粋関数: 新しい bank と subordinates を返す（live tick 用）。
 */
export function advanceSubordinates(
  subsIn: Subordinate[],
  bankIn: Record<string, number>,
  dt: number,
  eff: Effects,
): { bank: Record<string, number>; subordinates: Subordinate[]; produced: boolean } {
  const bank = { ...bankIn };
  const subs = subsIn.map((s) => ({ ...s }));
  let produced = false;

  for (const sub of subs) {
    if (!sub.assignment) continue;
    const action = ACTION_MAP[sub.assignment];
    if (!action) {
      sub.assignment = null;
      continue;
    }
    if (levelForXp(sub.xp) < action.level) continue;

    const effTime = action.time / subSpeedMult(sub, eff);
    sub.progress += dt;
    let guard = 1000;
    while (sub.progress >= effTime && guard-- > 0) {
      if (action.inputs) {
        const ok = Object.entries(action.inputs).every(
          ([id, q]) => (bank[id] ?? 0) >= (q as number),
        );
        if (!ok) {
          sub.progress = 0;
          break;
        }
        for (const [id, q] of Object.entries(action.inputs)) {
          bank[id] = (bank[id] ?? 0) - (q as number);
          if (bank[id] <= 0) delete bank[id];
        }
      }
      for (const [id, q] of Object.entries(action.outputs)) {
        bank[id] = (bank[id] ?? 0) + (q as number);
      }
      sub.xp += action.xp;
      sub.progress -= effTime;
      produced = true;
    }
  }
  return { bank, subordinates: subs, produced };
}

// UI通知系の型。
export interface Toast {
  id: number;
  text: string;
  icon?: string;
  kind?: "level" | "goal" | "info";
}

/** 直近のXP獲得インジケータ（同じスキルなら加算、しばらく無獲得で消える）。 */
export interface XpFlash {
  skillId: string;
  amount: number;
}

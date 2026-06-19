import { SHOP_MARKUP } from "@/constants/config";

/** ショップの購入価格（売値にマークアップ）。 */
export function shopPrice(sellPrice: number): number {
  return Math.max(1, Math.round(sellPrice * SHOP_MARKUP));
}

// 自作アイテムアイコン（フラットSVG）。lucideでは潰れる料理/パーツ/資源/ギアを
// 1個ずつ識別できるように手描き。icon文字列id → 描画関数。Icon が優先利用する。
import type { JSX } from "react";

type R = (s: number) => JSX.Element;

const svg = (children: JSX.Element): ((s: number) => JSX.Element) => {
  return (s: number) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      style={{ verticalAlign: "-0.15em", flexShrink: 0 }}
    >
      {children}
    </svg>
  );
};

export const ITEM_ICONS: Record<string, R> = {
  // ===== 資源 =====
  commit: svg(
    <g>
      <line x1="3" y1="12" x2="8" y2="12" stroke="#7c5cff" strokeWidth="2" />
      <line x1="16" y1="12" x2="21" y2="12" stroke="#7c5cff" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="#1f2630" stroke="#7c5cff" strokeWidth="2" />
    </g>,
  ),
  product: svg(
    <g>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" fill="#2f3a48" stroke="#6ee7a8" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" stroke="#6ee7a8" strokeWidth="1.2" fill="none" />
    </g>,
  ),

  // ===== 飲み物 =====
  coffee: svg(
    <g>
      <path d="M7 5h2M10 5h2" stroke="#9aa3ad" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="5" y="9" width="11" height="9" rx="2" fill="#8a5a3b" />
      <rect x="5" y="9" width="11" height="2.4" fill="#5c3a26" />
      <path d="M16 11h1.6a2.2 2.2 0 0 1 0 4.4H16" fill="none" stroke="#8a5a3b" strokeWidth="1.6" />
    </g>,
  ),
  water: svg(
    <g>
      <path d="M7 5h10l-1 14a1 1 0 0 1-1 .9H9a1 1 0 0 1-1-.9z" fill="#dff0ff" stroke="#4f9dff" strokeWidth="1" />
      <path d="M8.2 12h7.6l-.7 7a1 1 0 0 1-1 .9H9.9a1 1 0 0 1-1-.9z" fill="#4f9dff" />
    </g>,
  ),
  cola: svg(
    <g>
      <path d="M7 7h10l-1 12a1 1 0 0 1-1 .9H9a1 1 0 0 1-1-.9z" fill="#3a2a26" stroke="#e05656" strokeWidth="1" />
      <rect x="7" y="7" width="10" height="2.4" fill="#e05656" />
      <line x1="13" y1="3" x2="15" y2="8" stroke="#f2c14e" strokeWidth="1.6" strokeLinecap="round" />
    </g>,
  ),
  energy: svg(
    <g>
      <rect x="7" y="5" width="10" height="15" rx="2" fill="#1f2630" stroke="#6ee7a8" strokeWidth="1.2" />
      <path d="M12.5 8l-2.5 4h2l-1.5 4 4-5h-2z" fill="#f2c14e" />
    </g>,
  ),

  // ===== 食材 =====
  rice: svg(
    <g>
      <path d="M4 12c0 4 3.6 6 8 6s8-2 8-6z" fill="#eef2f6" stroke="#9aa3ad" strokeWidth="1" />
      <path d="M5 12c1.5-1.5 4-2 7-2s5.5.5 7 2" fill="none" stroke="#cfd6dd" strokeWidth="1" />
      <circle cx="8" cy="9" r="1" fill="#fff" /><circle cx="12" cy="8" r="1" fill="#fff" /><circle cx="15" cy="9" r="1" fill="#fff" />
    </g>,
  ),
  noodles: svg(
    <g>
      <path d="M4 13c0 4 3.6 6 8 6s8-2 8-6z" fill="#f2d49a" stroke="#caa45a" strokeWidth="1" />
      <path d="M7 13c0-4 1-7 2-8M11 13c0-5 1-7 1.5-8M15 13c0-4 1-6 2-7.5" fill="none" stroke="#e9c071" strokeWidth="1.4" strokeLinecap="round" />
    </g>,
  ),
  meat: svg(
    <g>
      <path d="M9 6a6 6 0 1 1-2 11l-2 2-1-1 2-2A6 6 0 0 1 9 6z" fill="#c0563f" stroke="#7d3325" strokeWidth="1" />
      <circle cx="11" cy="11" r="2.2" fill="#e7a08f" />
    </g>,
  ),
  fish_food: svg(
    <g>
      <path d="M3 12c4-5 11-5 15 0-4 5-11 5-15 0z" fill="#7fb6e6" stroke="#3f7fb8" strokeWidth="1" />
      <path d="M18 12l3-3v6z" fill="#7fb6e6" stroke="#3f7fb8" strokeWidth="1" />
      <circle cx="7" cy="11" r="1" fill="#1f2630" />
    </g>,
  ),
  veg: svg(
    <g>
      <path d="M11 8c-1 6-1 9-1 11 0 .6 2 .6 2 0 0-2 0-5-1-11z" fill="#e2832c" />
      <path d="M11 8c-2-2-1-4 1-5 0 2 1 3-1 5zM12 8c2-1 3 0 3 2-2 0-3-1-3-2z" fill="#5bbf6a" />
    </g>,
  ),
  dough: svg(
    <g>
      <ellipse cx="12" cy="14" rx="8" ry="5.5" fill="#ecd9b0" stroke="#c8b485" strokeWidth="1" />
      <circle cx="9" cy="13" r="1" fill="#d7c194" /><circle cx="14" cy="15" r="1" fill="#d7c194" /><circle cx="12" cy="12" r="1" fill="#d7c194" />
    </g>,
  ),

  // ===== 料理 =====
  onigiri: svg(
    <g>
      <path d="M12 4l8 14H4z" fill="#f5f7fa" stroke="#cdd5dd" strokeWidth="1" strokeLinejoin="round" />
      <rect x="8.5" y="13" width="7" height="5" fill="#2a2f36" />
    </g>,
  ),
  cupramen: svg(
    <g>
      <path d="M6 9h12l-1.2 9a1.5 1.5 0 0 1-1.5 1.3H8.7A1.5 1.5 0 0 1 7.2 18z" fill="#e05656" />
      <rect x="5.4" y="7.5" width="13.2" height="2.4" rx="1" fill="#fff" />
      <path d="M9 6c0-1.5 1-2 1-3M13 6c0-1.5 1-2 1-3" stroke="#9aa3ad" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </g>,
  ),
  bento: svg(
    <g>
      <rect x="3.5" y="7" width="17" height="11" rx="2" fill="#6b4a3a" stroke="#3f2b22" strokeWidth="1" />
      <rect x="5" y="8.5" width="6.5" height="8" rx="1" fill="#f5f7fa" />
      <rect x="12.5" y="8.5" width="6" height="3.6" rx="1" fill="#c0563f" />
      <rect x="12.5" y="12.8" width="6" height="3.7" rx="1" fill="#5bbf6a" />
    </g>,
  ),
  ramen: svg(
    <g>
      <path d="M4 11h16c0 5-3.6 8-8 8s-8-3-8-8z" fill="#f0e4c8" stroke="#caa45a" strokeWidth="1" />
      <path d="M3 11h18" stroke="#e05656" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9" cy="14" r="2" fill="#fff" /><circle cx="9" cy="14" r="1" fill="#f2c14e" />
      <path d="M14 12.5l3-1.5M14 15l3.5-1" stroke="#caa45a" strokeWidth="1.2" strokeLinecap="round" />
    </g>,
  ),
  gyudon: svg(
    <g>
      <path d="M4 11h16c0 5-3.6 8-8 8s-8-3-8-8z" fill="#eef2f6" stroke="#9aa3ad" strokeWidth="1" />
      <path d="M6 12c3-1.5 9-1.5 12 0-1 2-3 2.5-6 2.5s-5-.5-6-2.5z" fill="#a85c3a" />
      <path d="M8 12.5h2M12 13h2.5" stroke="#6e3a22" strokeWidth="1" strokeLinecap="round" />
    </g>,
  ),
  pizza: svg(
    <g>
      <path d="M12 3l8 5c-2 7-6 12-8 13-2-1-6-6-8-13z" fill="#f2c14e" stroke="#caa45a" strokeWidth="1" strokeLinejoin="round" />
      <path d="M12 3l8 5-1.2 2c-4.5-2-9.5-2-13.6 0L4 8z" fill="#e0a73a" />
      <circle cx="10" cy="11" r="1.3" fill="#e05656" /><circle cx="14" cy="13" r="1.3" fill="#e05656" /><circle cx="11" cy="16" r="1.3" fill="#e05656" />
    </g>,
  ),
  sushi: svg(
    <g>
      <rect x="4" y="13" width="16" height="5" rx="2.5" fill="#f5f7fa" stroke="#cdd5dd" strokeWidth="1" />
      <path d="M4.5 13c3-3 12-3 15 0z" fill="#e0705a" />
      <rect x="10" y="11" width="4" height="7.5" rx="0.6" fill="#2a2f36" />
    </g>,
  ),
  steak: svg(
    <g>
      <path d="M5 9a7 5 0 1 1 12 4 7 5 0 1 1-12-4z" fill="#a8472f" stroke="#6e3a22" strokeWidth="1" />
      <path d="M9 9.5a4 3 0 1 1 5 3" fill="#c97e4a" opacity="0.6" />
      <path d="M17 8l3-1M18 11l3 0" stroke="#e8e0d0" strokeWidth="1.5" strokeLinecap="round" />
    </g>,
  ),
  leave: svg(
    <g>
      <circle cx="17" cy="7" r="3" fill="#f2c14e" />
      <path d="M3 12c3-5 8-5 9 0z" fill="#5bbf6a" />
      <line x1="8" y1="12" x2="8" y2="20" stroke="#6b4a3a" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="3" y1="20" x2="21" y2="20" stroke="#9aa3ad" strokeWidth="1.4" strokeLinecap="round" />
    </g>,
  ),

  // ===== PCパーツ =====
  cpu: svg(
    <g>
      <rect x="7" y="7" width="10" height="10" rx="1.5" fill="#2e7d52" stroke="#1f5c3c" strokeWidth="1" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" fill="#6ee7a8" />
      <g stroke="#9aa3ad" strokeWidth="1.2" strokeLinecap="round">
        <path d="M9 7V5M12 7V5M15 7V5M9 19v-2M12 19v-2M15 19v-2M7 9H5M7 12H5M7 15H5M19 9h-2M19 12h-2M19 15h-2" />
      </g>
    </g>,
  ),
  gpu: svg(
    <g>
      <rect x="3" y="8" width="18" height="9" rx="1.5" fill="#2f3a48" stroke="#4f9dff" strokeWidth="1" />
      <circle cx="9" cy="12.5" r="3" fill="#1f2630" stroke="#4f9dff" strokeWidth="1" />
      <path d="M9 10.5v4M7.5 12.5h3" stroke="#4f9dff" strokeWidth="1" />
      <rect x="14" y="10.5" width="5" height="4" rx="0.5" fill="#1f2630" />
      <path d="M5 17v2M9 17v2" stroke="#9aa3ad" strokeWidth="1.4" />
    </g>,
  ),
  ram: svg(
    <g>
      <rect x="3" y="8" width="18" height="8" rx="1" fill="#2f3a48" stroke="#6ee7a8" strokeWidth="1" />
      <g fill="#1f2630">
        <rect x="5" y="9.5" width="2.4" height="3.5" /><rect x="8" y="9.5" width="2.4" height="3.5" /><rect x="11" y="9.5" width="2.4" height="3.5" /><rect x="14" y="9.5" width="2.4" height="3.5" /><rect x="17" y="9.5" width="1.6" height="3.5" />
      </g>
      <path d="M5 16v1.5M19 16v1.5" stroke="#9aa3ad" strokeWidth="2.2" />
    </g>,
  ),
  ssd: svg(
    <g>
      <rect x="5" y="5" width="14" height="14" rx="2" fill="#2f3a48" stroke="#9aa3ad" strokeWidth="1" />
      <rect x="8" y="8" width="8" height="5" rx="1" fill="#1f2630" />
      <circle cx="9.5" cy="16" r="1" fill="#6ee7a8" /><circle cx="13" cy="16" r="1" fill="#9aa3ad" />
    </g>,
  ),

  // ===== ギア =====
  keyboard: svg(
    <g>
      <rect x="2.5" y="7" width="19" height="10" rx="2" fill="#2f3a48" stroke="#9aa3ad" strokeWidth="1" />
      <g fill="#cfd6dd">
        <rect x="5" y="9" width="2" height="2" rx="0.4" /><rect x="8" y="9" width="2" height="2" rx="0.4" /><rect x="11" y="9" width="2" height="2" rx="0.4" /><rect x="14" y="9" width="2" height="2" rx="0.4" /><rect x="17" y="9" width="2" height="2" rx="0.4" />
        <rect x="7" y="13" width="10" height="2" rx="0.5" />
      </g>
    </g>,
  ),
  mouse: svg(
    <g>
      <rect x="7" y="4" width="10" height="16" rx="5" fill="#2f3a48" stroke="#9aa3ad" strokeWidth="1" />
      <line x1="12" y1="5" x2="12" y2="10" stroke="#9aa3ad" strokeWidth="1" />
      <circle cx="12" cy="8" r="1" fill="#6ee7a8" />
    </g>,
  ),
  pc: svg(
    <g>
      <rect x="3" y="4" width="18" height="12" rx="1.5" fill="#1f2630" stroke="#4f9dff" strokeWidth="1.2" />
      <rect x="5" y="6" width="14" height="8" rx="0.5" fill="#10202f" />
      <path d="M8 9l-1.5 1.5L8 12M16 9l1.5 1.5L16 12" stroke="#6ee7a8" strokeWidth="1.2" fill="none" />
      <path d="M9 19h6M10 16v3M14 16v3" stroke="#9aa3ad" strokeWidth="1.4" strokeLinecap="round" />
    </g>,
  ),
  shirt: svg(
    <g>
      <path d="M9 4l3 2 3-2 5 3-2 3-2-1v8H8v-8l-2 1-2-3z" fill="#4f9dff" stroke="#3a78c2" strokeWidth="1" strokeLinejoin="round" />
    </g>,
  ),
  hair: svg(
    <g>
      <path d="M5 14c0-6 3.5-9 7-9s7 3 7 9c-1.5-2-3-2.5-3.5-1-1-2-2.5-2-3.5-.5-1-2-2.5-2-3.5 0C8 11 6.5 12 5 14z" fill="#5c3a26" />
    </g>,
  ),
  avatar: svg(
    <g>
      <circle cx="12" cy="12" r="9" fill="#2f3a48" stroke="#9aa3ad" strokeWidth="1" />
      <circle cx="12" cy="10" r="3.2" fill="#cfd6dd" />
      <path d="M6.5 18c1.2-3 9.8-3 11 0" fill="#cfd6dd" />
    </g>,
  ),
  editor: svg(
    <g>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="#1f2630" stroke="#9aa3ad" strokeWidth="1" />
      <path d="M3 8h18" stroke="#9aa3ad" strokeWidth="1" />
      <circle cx="5.5" cy="6.5" r="0.7" fill="#e05656" /><circle cx="7.6" cy="6.5" r="0.7" fill="#f2c14e" /><circle cx="9.7" cy="6.5" r="0.7" fill="#6ee7a8" />
      <path d="M9 11l-2 2.5 2 2.5M15 11l2 2.5-2 2.5" stroke="#4f9dff" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </g>,
  ),

  // ===== その他 =====
  cert: svg(
    <g>
      <rect x="4" y="4" width="16" height="12" rx="1.5" fill="#f5f7fa" stroke="#caa45a" strokeWidth="1" />
      <path d="M7 8h10M7 11h6" stroke="#9aa3ad" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3" fill="#f2c14e" stroke="#caa45a" strokeWidth="1" />
      <path d="M14.5 18.5l-1 3 2.5-1.5 2.5 1.5-1-3" fill="#e05656" />
    </g>,
  ),
  kudos: svg(
    <g>
      <path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.5 12 20 12 20z" fill="#e05656" />
    </g>,
  ),
  techdebt: svg(
    <g>
      <path d="M12 4l9 16H3z" fill="#3a2a26" stroke="#e05656" strokeWidth="1.4" strokeLinejoin="round" />
      <line x1="12" y1="10" x2="12" y2="15" stroke="#f2c14e" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.1" fill="#f2c14e" />
    </g>,
  ),
};

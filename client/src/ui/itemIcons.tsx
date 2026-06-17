// 自作アイテムアイコン（フラットSVG）。各図形を viewBox(0..24) いっぱいに描いて
// タイル枠を埋める。lucideで潰れる料理/パーツ/資源/ギアを1個ずつ識別可能に。
import type { JSX } from "react";

type R = (s: number) => JSX.Element;

const svg = (children: JSX.Element): R => {
  return (s: number) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      style={{ verticalAlign: "-0.15em", flexShrink: 0, display: "block" }}
    >
      {children}
    </svg>
  );
};

export const ITEM_ICONS: Record<string, R> = {
  // ===== 資源 =====
  commit: svg(
    <g>
      <line x1="1" y1="12" x2="7" y2="12" stroke="#7c5cff" strokeWidth="2.6" />
      <line x1="17" y1="12" x2="23" y2="12" stroke="#7c5cff" strokeWidth="2.6" />
      <circle cx="12" cy="12" r="6" fill="#1f2630" stroke="#7c5cff" strokeWidth="2.6" />
    </g>,
  ),
  product: svg(
    <g>
      <path d="M12 1l10.5 5.8v10.4L12 23 1.5 17.2V6.8z" fill="#2f3a48" stroke="#6ee7a8" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M1.5 6.8L12 12.6l10.5-5.8M12 12.6V23" stroke="#6ee7a8" strokeWidth="1.4" fill="none" />
    </g>,
  ),

  // ===== 飲み物 =====
  coffee: svg(
    <g>
      <path d="M6 2v3M9.5 2v3M13 2v3" stroke="#9aa3ad" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="2.5" y="7.5" width="15" height="14" rx="2.5" fill="#8a5a3b" />
      <rect x="2.5" y="7.5" width="15" height="3.4" fill="#5c3a26" />
      <path d="M17.5 10h2.4a3.3 3.3 0 0 1 0 6.6h-2.4" fill="none" stroke="#8a5a3b" strokeWidth="2.2" />
    </g>,
  ),
  water: svg(
    <g>
      <path d="M4 2h16l-1.6 19a1.6 1.6 0 0 1-1.6 1.5H7.2A1.6 1.6 0 0 1 5.6 21z" fill="#dff0ff" stroke="#4f9dff" strokeWidth="1.4" />
      <path d="M5.4 11h13.2l-1 10a1.6 1.6 0 0 1-1.6 1.5H8A1.6 1.6 0 0 1 6.4 21z" fill="#4f9dff" />
    </g>,
  ),
  cola: svg(
    <g>
      <path d="M5 4h14l-1.4 17a1.6 1.6 0 0 1-1.6 1.5H8A1.6 1.6 0 0 1 6.4 21z" fill="#3a2422" stroke="#e05656" strokeWidth="1.4" />
      <rect x="5" y="4" width="14" height="3.4" rx="1" fill="#e05656" />
      <line x1="14" y1="1" x2="18" y2="7" stroke="#f2c14e" strokeWidth="2.2" strokeLinecap="round" />
    </g>,
  ),
  energy: svg(
    <g>
      <rect x="5" y="2.5" width="14" height="19" rx="2.5" fill="#1f2630" stroke="#6ee7a8" strokeWidth="1.6" />
      <path d="M13 6l-4 7h3l-2 5 6-8h-3z" fill="#f2c14e" />
    </g>,
  ),

  // ===== 食材 =====
  rice: svg(
    <g>
      <path d="M2 11c0 6 4.5 9 10 9s10-3 10-9z" fill="#eef2f6" stroke="#9aa3ad" strokeWidth="1.4" />
      <path d="M3 11c2-2 5.5-3 9-3s7 1 9 3" fill="none" stroke="#cfd6dd" strokeWidth="1.2" />
      <circle cx="7" cy="8" r="1.3" fill="#fff" /><circle cx="12" cy="6.5" r="1.3" fill="#fff" /><circle cx="17" cy="8" r="1.3" fill="#fff" />
    </g>,
  ),
  noodles: svg(
    <g>
      <path d="M2 12c0 6 4.5 9 10 9s10-3 10-9z" fill="#f2d49a" stroke="#caa45a" strokeWidth="1.4" />
      <path d="M6 12c0-6 1.5-9 2.5-11M11 12c0-7 1-9 1.8-11M16 12c0-6 1.5-8 2.5-10.5" fill="none" stroke="#e9c071" strokeWidth="2" strokeLinecap="round" />
    </g>,
  ),
  meat: svg(
    <g>
      <path d="M9 2a8 8 0 1 1-3 15l-3 3-1.4-1.4 3-3A8 8 0 0 1 9 2z" fill="#c0563f" stroke="#7d3325" strokeWidth="1.4" />
      <circle cx="12" cy="9.5" r="3.2" fill="#e7a08f" />
    </g>,
  ),
  fish_food: svg(
    <g>
      <path d="M1 12c5-7 13-7 18 0-5 7-13 7-18 0z" fill="#7fb6e6" stroke="#3f7fb8" strokeWidth="1.4" />
      <path d="M19 12l4-4.5v9z" fill="#7fb6e6" stroke="#3f7fb8" strokeWidth="1.4" />
      <circle cx="6" cy="10.5" r="1.4" fill="#1f2630" />
    </g>,
  ),
  veg: svg(
    <g>
      <path d="M11 6c-1.5 8-1.5 12-1.5 15 0 1 3 1 3 0 0-3 0-7-1.5-15z" fill="#e2832c" />
      <path d="M11 6c-3-3-1.5-6 1.5-7 0 3 1.5 4.5-1.5 7zM12.5 6c3-1.5 4.5 0 4.5 3-3 0-4.5-1.5-4.5-3z" fill="#5bbf6a" />
    </g>,
  ),
  dough: svg(
    <g>
      <ellipse cx="12" cy="13" rx="11" ry="7.5" fill="#ecd9b0" stroke="#c8b485" strokeWidth="1.4" />
      <circle cx="8" cy="12" r="1.3" fill="#d7c194" /><circle cx="15" cy="14.5" r="1.3" fill="#d7c194" /><circle cx="12.5" cy="11" r="1.3" fill="#d7c194" /><circle cx="16" cy="11.5" r="1.1" fill="#d7c194" />
    </g>,
  ),

  // ===== 料理 =====
  onigiri: svg(
    <g>
      <path d="M12 1.5L22.5 21H1.5z" fill="#f5f7fa" stroke="#cdd5dd" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="7" y="14" width="10" height="7" fill="#2a2f36" />
    </g>,
  ),
  cupramen: svg(
    <g>
      <path d="M4 8h16l-1.6 12.5a1.8 1.8 0 0 1-1.8 1.5H7.4a1.8 1.8 0 0 1-1.8-1.5z" fill="#e05656" />
      <rect x="3" y="6" width="18" height="3.2" rx="1.4" fill="#fff" />
      <path d="M8 4.5c0-2 1.3-2.5 1.3-4M13 4.5c0-2 1.3-2.5 1.3-4M11 4.5c0-1.5 1-2 1-3.5" stroke="#9aa3ad" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </g>,
  ),
  bento: svg(
    <g>
      <rect x="1.5" y="5" width="21" height="14" rx="2.5" fill="#6b4a3a" stroke="#3f2b22" strokeWidth="1.4" />
      <rect x="3.5" y="7" width="8" height="10" rx="1" fill="#f5f7fa" />
      <rect x="12.5" y="7" width="8" height="4.6" rx="1" fill="#c0563f" />
      <rect x="12.5" y="12.4" width="8" height="4.6" rx="1" fill="#5bbf6a" />
    </g>,
  ),
  ramen: svg(
    <g>
      <path d="M2 10h20c0 6.5-4.5 10.5-10 10.5S2 16.5 2 10z" fill="#f0e4c8" stroke="#caa45a" strokeWidth="1.4" />
      <path d="M1 10h22" stroke="#e05656" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="8" cy="14" r="2.8" fill="#fff" /><circle cx="8" cy="14" r="1.4" fill="#f2c14e" />
      <path d="M14.5 12l4-2M14.5 15.5l4.5-1.5" stroke="#caa45a" strokeWidth="1.6" strokeLinecap="round" />
    </g>,
  ),
  gyudon: svg(
    <g>
      <path d="M2 10h20c0 6.5-4.5 10.5-10 10.5S2 16.5 2 10z" fill="#eef2f6" stroke="#9aa3ad" strokeWidth="1.4" />
      <path d="M4.5 11.5c4-2 11-2 15 0-1.5 3-4 3.5-7.5 3.5s-6-.5-7.5-3.5z" fill="#a85c3a" />
      <path d="M7 12.5h3M13 13h3.5" stroke="#6e3a22" strokeWidth="1.4" strokeLinecap="round" />
    </g>,
  ),
  pizza: svg(
    <g>
      <path d="M12 1.5l10.5 6.5C20 17 14.5 22.5 12 23 9.5 22.5 4 17 1.5 8z" fill="#f2c14e" stroke="#caa45a" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 1.5l10.5 6.5-1.6 2.8C15 8 9 8 3.1 10.8L1.5 8z" fill="#e0a73a" />
      <circle cx="9.5" cy="12" r="1.7" fill="#e05656" /><circle cx="14.5" cy="14" r="1.7" fill="#e05656" /><circle cx="11" cy="18" r="1.7" fill="#e05656" />
    </g>,
  ),
  sushi: svg(
    <g>
      <rect x="1.5" y="13" width="21" height="6.5" rx="3.2" fill="#f5f7fa" stroke="#cdd5dd" strokeWidth="1.4" />
      <path d="M2 13c4-4 16-4 20 0z" fill="#e0705a" />
      <rect x="9.5" y="10" width="5" height="9.5" rx="0.8" fill="#2a2f36" />
    </g>,
  ),
  steak: svg(
    <g>
      <path d="M3 9a9 6.5 0 1 1 15 5 9 6.5 0 1 1-15-5z" fill="#a8472f" stroke="#6e3a22" strokeWidth="1.4" />
      <path d="M8 9.5a5 4 0 1 1 6.5 4" fill="#c97e4a" opacity="0.6" />
      <path d="M18.5 7l4-1.5M19.5 11l4 0M19 14.5l3.5 1.5" stroke="#e8e0d0" strokeWidth="2" strokeLinecap="round" />
    </g>,
  ),
  leave: svg(
    <g>
      <circle cx="18" cy="6" r="4" fill="#f2c14e" />
      <path d="M1.5 12c4-7 11-7 13 0z" fill="#5bbf6a" />
      <line x1="8" y1="12" x2="8" y2="22" stroke="#6b4a3a" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="1.5" y1="22" x2="22.5" y2="22" stroke="#9aa3ad" strokeWidth="1.8" strokeLinecap="round" />
    </g>,
  ),

  // ===== PCパーツ =====
  cpu: svg(
    <g>
      <rect x="5" y="5" width="14" height="14" rx="1.6" fill="#2e7d52" stroke="#1f5c3c" strokeWidth="1.4" />
      <rect x="9" y="9" width="6" height="6" rx="0.8" fill="#6ee7a8" />
      <g stroke="#9aa3ad" strokeWidth="1.6" strokeLinecap="round">
        <path d="M8 5V2M12 5V2M16 5V2M8 22v-3M12 22v-3M16 22v-3M5 8H2M5 12H2M5 16H2M22 8h-3M22 12h-3M22 16h-3" />
      </g>
    </g>,
  ),
  gpu: svg(
    <g>
      <rect x="1" y="6" width="22" height="12" rx="1.6" fill="#2f3a48" stroke="#4f9dff" strokeWidth="1.4" />
      <circle cx="8" cy="12" r="4" fill="#1f2630" stroke="#4f9dff" strokeWidth="1.4" />
      <path d="M8 9v6M5 12h6" stroke="#4f9dff" strokeWidth="1.4" />
      <rect x="14" y="9" width="7" height="6" rx="0.8" fill="#1f2630" />
      <path d="M4 18v3.5M9 18v3.5" stroke="#9aa3ad" strokeWidth="2" />
    </g>,
  ),
  ram: svg(
    <g>
      <rect x="1" y="6" width="22" height="11" rx="1.4" fill="#2f3a48" stroke="#6ee7a8" strokeWidth="1.4" />
      <g fill="#1f2630">
        <rect x="3.5" y="8" width="3" height="5" /><rect x="7.5" y="8" width="3" height="5" /><rect x="11.5" y="8" width="3" height="5" /><rect x="15.5" y="8" width="3" height="5" /><rect x="19.5" y="8" width="2" height="5" />
      </g>
      <path d="M4 17v3M20 17v3" stroke="#9aa3ad" strokeWidth="3" />
    </g>,
  ),
  ssd: svg(
    <g>
      <rect x="3" y="3" width="18" height="18" rx="2.4" fill="#2f3a48" stroke="#9aa3ad" strokeWidth="1.4" />
      <rect x="6.5" y="6.5" width="11" height="7" rx="1.2" fill="#1f2630" />
      <circle cx="8.5" cy="17.5" r="1.4" fill="#6ee7a8" /><circle cx="13" cy="17.5" r="1.4" fill="#9aa3ad" />
    </g>,
  ),

  // ===== ギア =====
  keyboard: svg(
    <g>
      <rect x="1" y="6" width="22" height="12" rx="2.4" fill="#2f3a48" stroke="#9aa3ad" strokeWidth="1.4" />
      <g fill="#cfd6dd">
        <rect x="4" y="8.5" width="2.6" height="2.6" rx="0.5" /><rect x="7.7" y="8.5" width="2.6" height="2.6" rx="0.5" /><rect x="11.4" y="8.5" width="2.6" height="2.6" rx="0.5" /><rect x="15.1" y="8.5" width="2.6" height="2.6" rx="0.5" /><rect x="18.8" y="8.5" width="1.6" height="2.6" rx="0.5" />
        <rect x="6.5" y="13" width="11" height="2.6" rx="0.6" />
      </g>
    </g>,
  ),
  mouse: svg(
    <g>
      <rect x="6" y="2" width="12" height="20" rx="6" fill="#2f3a48" stroke="#9aa3ad" strokeWidth="1.4" />
      <line x1="12" y1="3" x2="12" y2="11" stroke="#9aa3ad" strokeWidth="1.4" />
      <circle cx="12" cy="8" r="1.4" fill="#6ee7a8" />
    </g>,
  ),
  pc: svg(
    <g>
      <rect x="2" y="3" width="20" height="14" rx="1.8" fill="#1f2630" stroke="#4f9dff" strokeWidth="1.6" />
      <rect x="4" y="5" width="16" height="10" rx="0.8" fill="#10202f" />
      <path d="M9 8l-2 2 2 2M15 8l2 2-2 2" stroke="#6ee7a8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M8 21h8M10 17v4M14 17v4" stroke="#9aa3ad" strokeWidth="1.8" strokeLinecap="round" />
    </g>,
  ),
  shirt: svg(
    <g>
      <path d="M8.5 2L12 4.5 15.5 2 22 6l-2.5 4-2.5-1.4V21H7V8.6L4.5 10 2 6z" fill="#4f9dff" stroke="#3a78c2" strokeWidth="1.4" strokeLinejoin="round" />
    </g>,
  ),
  hair: svg(
    <g>
      <path d="M3 16C3 7 7.5 2 12 2s9 5 9 14c-2-3-4-3.5-4.7-1.3-1.3-2.7-3.3-2.7-4.6-.7-1.3-2.7-3.3-2.7-4.6 0C6 11.5 4.5 13 3 16z" fill="#5c3a26" />
    </g>,
  ),
  avatar: svg(
    <g>
      <circle cx="12" cy="12" r="11" fill="#2f3a48" stroke="#9aa3ad" strokeWidth="1.4" />
      <circle cx="12" cy="9.5" r="4" fill="#cfd6dd" />
      <path d="M4 21c1.5-4 14.5-4 16 0" fill="#cfd6dd" />
    </g>,
  ),
  editor: svg(
    <g>
      <rect x="1.5" y="3.5" width="21" height="17" rx="2.4" fill="#1f2630" stroke="#9aa3ad" strokeWidth="1.4" />
      <path d="M1.5 8h21" stroke="#9aa3ad" strokeWidth="1.2" />
      <circle cx="4.5" cy="5.7" r="0.9" fill="#e05656" /><circle cx="7.2" cy="5.7" r="0.9" fill="#f2c14e" /><circle cx="9.9" cy="5.7" r="0.9" fill="#6ee7a8" />
      <path d="M8.5 11l-3 3.5 3 3.5M15.5 11l3 3.5-3 3.5" stroke="#4f9dff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>,
  ),

  // ===== 電子部品 / 基板 =====
  components: svg(
    <g>
      {/* 抵抗器 */}
      <line x1="1" y1="12" x2="6" y2="12" stroke="#9aa3ad" strokeWidth="1.8" />
      <line x1="18" y1="12" x2="23" y2="12" stroke="#9aa3ad" strokeWidth="1.8" />
      <rect x="6" y="8.5" width="12" height="7" rx="1.5" fill="#d8b48a" stroke="#a07c4f" strokeWidth="1" />
      <rect x="8.5" y="8.5" width="1.6" height="7" fill="#c0563f" />
      <rect x="11.2" y="8.5" width="1.6" height="7" fill="#7d3325" />
      <rect x="13.9" y="8.5" width="1.6" height="7" fill="#f2c14e" />
    </g>,
  ),
  board: svg(
    <g>
      <rect x="2" y="3" width="20" height="18" rx="2" fill="#1f5c3c" stroke="#123f29" strokeWidth="1.2" />
      <rect x="9" y="9" width="6" height="6" rx="0.8" fill="#2a2f36" />
      <g stroke="#7ddca8" strokeWidth="1" fill="none">
        <path d="M5 6h6M5 9v6M19 6h-6M19 18h-7M9 18H5" />
      </g>
      <circle cx="5.5" cy="6" r="1" fill="#f2c14e" /><circle cx="18.5" cy="18" r="1" fill="#f2c14e" /><circle cx="18.5" cy="6" r="1" fill="#cfd6dd" /><circle cx="5.5" cy="18" r="1" fill="#cfd6dd" />
    </g>,
  ),

  // ===== その他 =====
  cert: svg(
    <g>
      <rect x="2" y="2.5" width="20" height="15" rx="1.8" fill="#f5f7fa" stroke="#caa45a" strokeWidth="1.4" />
      <path d="M5 6.5h14M5 10h9" stroke="#9aa3ad" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="17" r="4" fill="#f2c14e" stroke="#caa45a" strokeWidth="1.2" />
      <path d="M15.5 20.5l-1.2 3.5 3-2 3 2-1.2-3.5" fill="#e05656" />
    </g>,
  ),
  kudos: svg(
    <g>
      <path d="M12 22S2 15.5 2 8.8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 10 2.8C22 15.5 12 22 12 22z" fill="#e05656" />
    </g>,
  ),
  techdebt: svg(
    <g>
      <path d="M12 2l10.5 19H1.5z" fill="#3a2a26" stroke="#e05656" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="15" stroke="#f2c14e" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1.3" fill="#f2c14e" />
    </g>,
  ),

  // ===== 農産物（具体的な作物。lucideに無いので自作） =====
  parsnip: svg(
    <g>
      <path d="M7.6 8.5L16.4 8.5L12 22z" fill="#ece2c8" stroke="#b8a878" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M9.2 11.5h5.6M9.9 14.5h4.2M10.6 17.5h2.8" stroke="#b8a878" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M12 8.5V3.4M12 7.5L8.3 4M12 7.5l3.7-3.6" stroke="#3f8a37" strokeWidth="1.7" strokeLinecap="round" />
    </g>,
  ),
  seed: svg(
    <g fill="#b07d3a" stroke="#7c531f" strokeWidth="0.9">
      <ellipse cx="8" cy="15.5" rx="2.8" ry="4.2" transform="rotate(-22 8 15.5)" />
      <ellipse cx="15.5" cy="14.5" rx="2.8" ry="4.2" transform="rotate(20 15.5 14.5)" />
      <ellipse cx="11.7" cy="9.5" rx="2.8" ry="4.2" transform="rotate(-3 11.7 9.5)" />
    </g>,
  ),
  tomato: svg(
    <g>
      <circle cx="12" cy="14.5" r="8.5" fill="#e8412f" stroke="#bf2d20" strokeWidth="1.2" />
      <ellipse cx="8.6" cy="11.4" rx="2.3" ry="1.5" fill="#ff8a72" opacity="0.55" />
      <path d="M12 7l1.7 2.6 3-.7-1.3 2.8 1.3 2.8-3-.7L12 16.2l-1.7-2.5-3 .7 1.3-2.8-1.3-2.8 3 .7z" fill="#43933a" stroke="#2e6a28" strokeWidth="0.7" strokeLinejoin="round" />
      <path d="M12 7.5V3.5" stroke="#2e6a28" strokeWidth="1.5" strokeLinecap="round" />
    </g>,
  ),
  carrot: svg(
    <g>
      <path d="M7.3 8.5L16.7 8.5L12 22z" fill="#ef7d22" stroke="#c75f12" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M9 11.5h6M9.8 14.5h4.4M10.6 17.5h2.8" stroke="#c75f12" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M12 8.5V3.4M12 7.5L8.3 4M12 7.5l3.7-3.6" stroke="#3f8a37" strokeWidth="1.7" strokeLinecap="round" />
    </g>,
  ),
  edamame: svg(
    <g transform="rotate(-28 12 12)">
      <rect x="3" y="9" width="18" height="6" rx="3" fill="#7cb342" stroke="#4e7d22" strokeWidth="1.2" />
      <circle cx="8" cy="12" r="1.9" fill="#aed581" />
      <circle cx="12" cy="12" r="1.9" fill="#aed581" />
      <circle cx="16" cy="12" r="1.9" fill="#aed581" />
    </g>,
  ),
  shiitake: svg(
    <g>
      <rect x="9.5" y="12" width="5" height="9" rx="2" fill="#e8d5b0" stroke="#b89a6a" strokeWidth="1" />
      <path d="M3 12.5C3 5 21 5 21 12.5C21 14.5 3 14.5 3 12.5z" fill="#7a4a2b" stroke="#5a3520" strokeWidth="1.2" />
      <path d="M6 11.4l2-2M10 11l1.5-2.3M14 11l1.5-2.3M18 11.4l-2-2" stroke="#5a3520" strokeWidth="0.8" strokeLinecap="round" />
    </g>,
  ),
  strawberry: svg(
    <g>
      <path d="M12 21.5C5.5 18 3.5 12 5.7 8.6C8 5.6 16 5.6 18.3 8.6C20.5 12 18.5 18 12 21.5z" fill="#e63950" stroke="#b3243c" strokeWidth="1.1" />
      <path d="M6 8.2q3-3 6-2.4q3-0.6 6 2.4q-3 1.1-6 0.5q-3 0.6-6-0.5z" fill="#43933a" stroke="#2e6a28" strokeWidth="0.7" />
      <path d="M12 5.8V2.9" stroke="#2e6a28" strokeWidth="1.4" strokeLinecap="round" />
      <g fill="#ffd24a">
        <circle cx="9" cy="11.2" r="0.6" /><circle cx="12" cy="12.6" r="0.6" /><circle cx="15" cy="11.2" r="0.6" />
        <circle cx="10.4" cy="14.6" r="0.6" /><circle cx="13.6" cy="14.6" r="0.6" /><circle cx="12" cy="17" r="0.6" />
      </g>
    </g>,
  ),
  apple: svg(
    <g>
      <path d="M12 7.5C9.5 5.5 4 6 3.6 12C3.2 17.2 7 22 12 20.8C17 22 20.8 17.2 20.4 12C20 6 14.5 5.5 12 7.5z" fill="#e23b2e" stroke="#b52a20" strokeWidth="1.1" />
      <ellipse cx="8" cy="11.5" rx="1.9" ry="3" fill="#ff7a63" opacity="0.5" />
      <path d="M12.4 7C12.4 4.3 13.4 3.2 15.2 3" stroke="#7a4a2b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M13 4.6q2.6-2 4.6-1q-0.8 2.8-3.7 2.3z" fill="#43933a" stroke="#2e6a28" strokeWidth="0.6" />
    </g>,
  ),
};

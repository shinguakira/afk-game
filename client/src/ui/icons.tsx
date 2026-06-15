import type { IconType } from "react-icons";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNodedotjs,
  SiNextdotjs,
  SiSharp,
  SiCplusplus,
  SiC,
  SiRust,
  SiPython,
  SiUnity,
  SiUnrealengine,
  SiGodotengine,
  SiArduino,
  SiPytorch,
  SiTensorflow,
  SiPandas,
  SiGo,
  SiDart,
  SiFlutter,
  SiSwift,
  SiKotlin,
} from "react-icons/si";
import {
  LuGlobe,
  LuGamepad2,
  LuCpu,
  LuBrain,
  LuServer,
  LuSmartphone,
  LuBug,
  LuHammer,
  LuShield,
  LuBattery,
  LuCoffee,
  LuBriefcase,
  LuRocket,
  LuUsers,
  LuTrendingUp,
  LuArchive,
  LuShoppingCart,
  LuFolderKanban,
  LuFlame,
  LuBird,
  LuFileText,
  LuPlay,
  LuSquare,
  LuSave,
  LuPalette,
  LuCog,
  LuWrench,
  LuChartColumn,
  LuMicroscope,
  LuClipboardList,
  LuSparkles,
  LuMegaphone,
  LuLeaf,
  LuBanknote,
  LuBot,
  LuUserPlus,
  LuTrash2,
  LuBuilding2,
  LuBox,
  LuGitCommitHorizontal,
  LuPackage,
  LuKeyboard,
  LuSearch,
  LuTriangleAlert,
} from "react-icons/lu";

// Central icon registry. Data files reference these string ids (no JSX in data).
const ICONS: Record<string, IconType> = {
  // domains
  web: LuGlobe,
  game: LuGamepad2,
  embedded: LuCpu,
  ai: LuBrain,
  infra: LuServer,
  mobile: LuSmartphone,

  // languages & frameworks (brand logos)
  javascript: SiJavascript,
  typescript: SiTypescript,
  react: SiReact,
  node: SiNodedotjs,
  nextjs: SiNextdotjs,
  csharp: SiSharp,
  cpp: SiCplusplus,
  c: SiC,
  rust: SiRust,
  python: SiPython,
  unity: SiUnity,
  unreal: SiUnrealengine,
  godot: SiGodotengine,
  arduino: SiArduino,
  pytorch: SiPytorch,
  tensorflow: SiTensorflow,
  pandas: SiPandas,
  go: SiGo,
  dart: SiDart,
  flutter: SiFlutter,
  swift: SiSwift,
  kotlin: SiKotlin,

  // combat stats
  debug: LuBug,
  impl: LuHammer,
  robust: LuShield,
  mental: LuBattery,

  // resources / concepts
  commit: LuGitCommitHorizontal,
  product: LuPackage,
  coffee: LuCoffee,
  editor: LuKeyboard,
  techdebt: LuTriangleAlert,
  kudos: LuSparkles,
  search: LuSearch,

  // tabs / ui
  career: LuTrendingUp,
  team: LuUsers,
  prestige: LuRocket,
  bank: LuArchive,
  shop: LuShoppingCart,
  projects: LuFolderKanban,
  company: LuBuilding2,
  stop: LuSquare,
  start: LuPlay,
  save: LuSave,
  fire: LuTrash2,
  hire: LuUserPlus,

  // job classes
  none: LuBriefcase,
  frontend: LuPalette,
  backend: LuCog,
  sre: LuWrench,
  data: LuChartColumn,
  qa: LuMicroscope,
  pm: LuClipboardList,
  fullstack: LuSparkles,
  security: LuShield,

  // prestige upgrades
  funding: LuBanknote,
  automation: LuBot,
  tech: LuBrain,
  brand: LuSparkles,
  wellness: LuLeaf,
  recruiting: LuMegaphone,
  delivery: LuFlame,

  // 案件 (monsters)
  bug_m: LuBug,
  newbie: LuBird,
  spec_change: LuFileText,
  review: LuSearch,
  incident: LuFlame,
  boss: LuBriefcase,
};

export interface IconProps {
  name?: string;
  size?: number;
  className?: string;
  color?: string;
  title?: string;
}

export function Icon({ name, size = 18, className, color, title }: IconProps) {
  const C = (name && ICONS[name]) || LuBox;
  return (
    <C
      size={size}
      className={className}
      color={color}
      title={title}
      style={{ verticalAlign: "-0.15em", flexShrink: 0 }}
    />
  );
}

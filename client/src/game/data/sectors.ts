import type { GameAction, Skill } from "../types";

// 言語以外の生産系スキル。3軸:
//  - platform 領域・プラットフォーム(何を作るか): 技術選択で決まる。フレームワークで橋渡し獲得。
//  - infra    インフラ・基盤(どこで動かすか): 言語非依存の独立ツール軸。
//  - domain   業界ドメイン(誰のために作るか): 業務知識。言語/プラットフォーム非依存。将来は案件駆動。
// それぞれ「基礎アクション(→コミット)」と「応用アクション(コミット消費→プロダクト)」を持つ。

const INFRA: [id: string, name: string, icon: string][] = [
  ["linux", "Linux", "linux"],
  ["docker", "Docker", "docker"],
  ["kubernetes", "Kubernetes", "kubernetes"],
  ["terraform", "Terraform", "terraform"],
  ["aws", "AWS", "aws"],
  ["gcp", "GCP", "gcp"],
  ["nginx", "Nginx", "nginx"],
];

// 領域・プラットフォーム = 何を作るか。フレームワーク(techtree)が主な伸び口。
const PLATFORM: [id: string, name: string, icon: string][] = [
  ["web", "Web", "web"],
  ["game", "ゲーム", "game"],
  ["mobile", "モバイル", "mobile"],
  ["embedded", "組み込み", "embedded"],
  ["aidata", "AI・データ", "ai_data"],
];

// 業界ドメイン = 誰のために作るか。言語にもプラットフォームにも依存しない業務知識。
const DOMAIN: [id: string, name: string, icon: string][] = [
  ["fintech", "金融 (FinTech)", "fintech"],
  ["ec", "EC・小売", "ec"],
  ["healthcare", "医療・ヘルスケア", "healthcare"],
  ["legal", "法務・リーガル", "legal"],
  ["public", "公共・行政", "public"],
];

export const INFRA_SKILLS: Skill[] = INFRA.map(([id, name, icon]) => ({
  id: `inf_${id}`,
  name,
  kind: "gather",
  category: "infra",
  icon,
}));

export const PLATFORM_SKILLS: Skill[] = PLATFORM.map(([id, name, icon]) => ({
  id: `plat_${id}`,
  name,
  kind: "gather",
  category: "platform",
  icon,
}));

export const DOMAIN_SKILLS: Skill[] = DOMAIN.map(([id, name, icon]) => ({
  id: `dom_${id}`,
  name,
  kind: "gather",
  category: "domain",
  icon,
}));

export const SOLDERING_SKILL: Skill = {
  id: "soldering",
  name: "はんだづけ",
  kind: "craft",
  category: "craft",
  icon: "soldering",
};

export const SECTOR_ACTIONS: GameAction[] = [
  // インフラ・クラウド
  ...INFRA.flatMap(([id, name, icon]): GameAction[] => [
    {
      id: `inf_${id}_setup`,
      skill: `inf_${id}`,
      name: `${name} を構築`,
      icon,
      level: 1,
      time: 3200,
      xp: 16,
      outputs: { commit: 1 },
    },
    {
      id: `inf_${id}_ops`,
      skill: `inf_${id}`,
      name: `${name} で本番運用`,
      icon,
      level: 8,
      time: 3700,
      xp: 32,
      inputs: { commit: 4 },
      outputs: {},
    },
  ]),
  // 領域・プラットフォーム（フレームワークが主な伸び口。これは言語非依存のベース練習）
  ...PLATFORM.flatMap(([id, name, icon]): GameAction[] => [
    {
      id: `plat_${id}_learn`,
      skill: `plat_${id}`,
      name: `${name}の基礎を学ぶ`,
      icon,
      level: 1,
      time: 3000,
      xp: 15,
      outputs: { commit: 1 },
    },
    {
      id: `plat_${id}_build`,
      skill: `plat_${id}`,
      name: `${name}システムを構築`,
      icon,
      level: 8,
      time: 3600,
      xp: 34,
      inputs: { commit: 4 },
      outputs: {},
    },
  ]),
  // 業界ドメイン（業務知識。当面は研究アクション。将来は案件討伐で伸びる設計）
  ...DOMAIN.flatMap(([id, name, icon]): GameAction[] => [
    {
      id: `dom_${id}_study`,
      skill: `dom_${id}`,
      name: `${name}の業務を研究`,
      icon,
      level: 1,
      time: 3000,
      xp: 15,
      outputs: { commit: 1 },
    },
    {
      id: `dom_${id}_expert`,
      skill: `dom_${id}`,
      name: `${name}のドメイン分析`,
      icon,
      level: 8,
      time: 3600,
      xp: 34,
      inputs: { commit: 4 },
      outputs: {},
    },
  ]),
  // はんだづけ → 基板
  {
    id: "solder_proto",
    skill: "soldering",
    name: "試作基板をはんだづけ",
    icon: "board",
    level: 1,
    time: 3000,
    xp: 18,
    inputs: { components: 3 },
    outputs: { board_proto: 1 },
  },
  {
    id: "solder_main",
    skill: "soldering",
    name: "メイン基板をはんだづけ",
    icon: "board",
    level: 8,
    time: 3600,
    xp: 40,
    inputs: { components: 6 },
    outputs: { board_main: 1 },
  },
  {
    id: "solder_hd",
    skill: "soldering",
    name: "高密度基板をはんだづけ",
    icon: "board",
    level: 16,
    time: 4200,
    xp: 72,
    inputs: { components: 10 },
    outputs: { board_hd: 1 },
  },
];

import type { GameAction, Skill } from "../types";
import { INFRA_URLS } from "./links";

// 言語以外の生産系スキル。3軸:
//  - platform 領域・プラットフォーム(何を作るか): 技術選択で決まる。フレームワークで橋渡し獲得。
//  - infra    インフラ・基盤(どこで動かすか): 言語非依存の独立ツール軸。実サービスを個別アクションで厚く。
//  - domain   業界ドメイン(誰のために作るか): 業務知識。言語/プラットフォーム非依存。将来は案件駆動。

// ===== インフラ・基盤 =====
// 各スキルが「実サービス/操作」を多数のアクションとして持つ（言語スキルの傘下ツリーと同じ厚み）。
// 知的活動なので産出は commit（売却＝稼ぐ・上位の素材）。Lvで段階解禁。
type InfraSvc = [label: string, level: number, icon?: string];
interface InfraSpec {
  id: string;
  name: string;
  icon: string;
  services: InfraSvc[];
}

const INFRA_SPECS: InfraSpec[] = [
  {
    id: "linux", name: "Linux", icon: "linux",
    services: [
      ["シェルで操作", 1], ["ファイル権限を管理", 2], ["systemd を設定", 3],
      ["プロセスを制御", 4], ["ネットワークを設定", 5], ["シェルスクリプトを書く", 6],
      ["ログを解析", 8], ["パフォーマンスチューニング", 10], ["カーネルパラメータ調整", 13],
    ],
  },
  {
    id: "docker", name: "Docker", icon: "docker",
    services: [
      ["イメージをビルド", 1], ["コンテナを実行", 2], ["Dockerfile を最適化", 4],
      ["compose で複数構成", 5], ["ボリューム/ネットワーク", 6], ["マルチステージビルド", 7],
      ["プライベートレジストリ運用", 9], ["脆弱性スキャン", 11],
    ],
  },
  {
    id: "kubernetes", name: "Kubernetes", icon: "kubernetes",
    services: [
      ["Pod / Deployment を作成", 1], ["Service / Ingress を設定", 4],
      ["ConfigMap / Secret を管理", 5], ["永続ボリューム", 7], ["Helm チャート作成", 8],
      ["HPA でオートスケール", 10], ["Operator を開発", 13], ["サービスメッシュ導入", 15],
    ],
  },
  {
    id: "terraform", name: "Terraform", icon: "terraform",
    services: [
      ["リソースを定義", 1], ["変数と出力を整理", 3], ["モジュール化", 5],
      ["tfstate を管理", 7], ["ワークスペース運用", 9], ["CI/CD に組込み", 11],
      ["マルチクラウド構成", 14],
    ],
  },
  {
    id: "aws", name: "AWS", icon: "aws",
    services: [
      ["EC2 でサーバ構築", 1], ["S3 にストレージ構築", 2], ["IAM で権限設計", 3],
      ["VPC でネットワーク構築", 4], ["RDS を運用", 5], ["Lambda をデプロイ", 6],
      ["CloudWatch で監視", 7], ["DynamoDB を設計", 8], ["CloudFront で配信", 9],
      ["ECS でコンテナ運用", 10], ["EKS を運用", 12], ["Redshift で分析", 14],
      ["SageMaker で機械学習", 16],
    ],
  },
  {
    id: "gcp", name: "GCP", icon: "gcp",
    services: [
      ["Compute Engine で VM 構築", 1], ["Cloud Storage を構築", 2], ["Cloud IAM で権限設計", 3],
      ["VPC を構築", 4], ["Cloud SQL を運用", 5], ["Cloud Functions をデプロイ", 6],
      ["Cloud Run で配信", 7], ["BigQuery で分析", 8], ["Pub/Sub で連携", 9],
      ["GKE を運用", 11], ["Dataflow で処理", 13], ["Vertex AI で学習", 16],
    ],
  },
  {
    id: "azure", name: "Azure", icon: "azure",
    services: [
      ["Virtual Machines で構築", 1], ["Blob Storage を構築", 2], ["Entra ID で認証設計", 3],
      ["VNet を構築", 4], ["Azure SQL を運用", 5], ["Functions をデプロイ", 6],
      ["App Service で配信", 7], ["Cosmos DB を設計", 8], ["AKS を運用", 11],
      ["Synapse で分析", 13], ["Azure ML で学習", 16],
    ],
  },
  {
    id: "nginx", name: "Nginx", icon: "nginx",
    services: [
      ["リバースプロキシ設定", 1], ["静的配信", 2], ["ロードバランス", 4],
      ["TLS 終端", 6], ["キャッシュ設定", 8], ["レート制限", 10],
    ],
  },
  {
    // 「DBどこいった?」→ データベースをインフラ軸の独立スキルに。エンジンを実物で扱う。
    id: "database", name: "データベース", icon: "database",
    services: [
      ["SQLite を扱う", 1], ["MySQL を運用", 2], ["PostgreSQL を運用", 4],
      ["インデックスを設計", 5], ["Redis でキャッシュ", 6], ["MongoDB を設計", 7],
      ["レプリケーション構成", 8], ["Elasticsearch で検索", 9], ["バックアップ/復旧", 10],
      ["シャーディング", 12], ["Cassandra を運用", 13], ["Kafka でストリーミング", 15],
    ],
  },
];

// ===== 領域・プラットフォーム（何を作るか）=====
// フレームワーク(techtree)が主な伸び口。AI と データ は別物として分離。
const PLATFORM: [id: string, name: string, icon: string][] = [
  ["web", "Web", "web"],
  ["game", "ゲーム", "game"],
  ["mobile", "モバイル", "mobile"],
  ["embedded", "組み込み", "embedded"],
  ["ai", "AI・機械学習", "ai"],
  ["data", "データ基盤・分析", "data"],
];

// ===== 業界ドメイン（誰のために）=====
// 言語にもプラットフォームにも依存しない業務知識。
const DOMAIN: [id: string, name: string, icon: string][] = [
  ["fintech", "金融 (FinTech)", "fintech"],
  ["ec", "EC・小売", "ec"],
  ["healthcare", "医療・ヘルスケア", "healthcare"],
  ["legal", "法務・リーガル", "legal"],
  ["public", "公共・行政", "public"],
];

export const INFRA_SKILLS: Skill[] = INFRA_SPECS.map((s) => ({
  id: `inf_${s.id}`,
  name: s.name,
  kind: "gather",
  category: "infra",
  icon: s.icon,
  url: INFRA_URLS[s.id],
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

export const ELECTRONICS_SKILL: Skill = {
  id: "electronics",
  name: "電子工作",
  kind: "craft",
  category: "craft",
  icon: "electronics",
};

export const SECTOR_ACTIONS: GameAction[] = [
  // インフラ・基盤: 各スキルの実サービスを個別アクションに（厚み）。産出は commit。
  ...INFRA_SPECS.flatMap((s) =>
    s.services.map(([label, level, icon], i): GameAction => ({
      id: `inf_${s.id}_${i}`,
      skill: `inf_${s.id}`,
      name: label,
      icon: icon ?? s.icon,
      level,
      time: 3200,
      xp: Math.round(13 + level * 2.2),
      outputs: { commit: level >= 8 ? 2 : 1 },
    })),
  ),
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
  // 電子工作: 電子部品を消費して電子工作品を作る（はんだづけは入口の一作業）。
  {
    id: "elec_led",
    skill: "electronics",
    name: "LED回路をはんだづけ",
    icon: "board",
    level: 1,
    time: 3000,
    xp: 18,
    inputs: { components: 3 },
    outputs: { circuit: 1 },
  },
  {
    id: "elec_mcu",
    skill: "electronics",
    name: "マイコンボードを自作",
    icon: "embedded",
    level: 5,
    time: 3600,
    xp: 38,
    inputs: { components: 5 },
    outputs: { microcontroller: 1 },
  },
  {
    id: "elec_rpi",
    skill: "electronics",
    name: "Raspberry Pi で電子工作",
    icon: "raspberrypi",
    level: 9,
    time: 4000,
    xp: 60,
    inputs: { components: 8 },
    outputs: { rpi_device: 1 },
  },
  {
    id: "elec_robot",
    skill: "electronics",
    name: "自作ロボットを組む",
    icon: "robot",
    level: 15,
    time: 4600,
    xp: 92,
    inputs: { components: 12 },
    outputs: { robot: 1 },
  },
];

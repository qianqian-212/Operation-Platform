import type {
  WorkbenchAllianceListData,
  WorkbenchCrossSchoolActivitiesData,
  WorkbenchEffectEvaluationData,
} from "@/features/workbench/types";

export function allianceListData(): WorkbenchAllianceListData {
  return {
    kind: "alliance-list",
    actionLabel: "查看全部",
    items: [
      {
        id: "alliance-east",
        title: "城东学区教研联盟",
        statusLabel: "使用中",
        statusTone: "success",
        createdAt: "2026-07-12 创建",
        adminName: "李明华",
        description: "聚焦小学语文与数学跨校教研，常态化开展集体备课与课例研讨。",
        stats: [
          { label: "成员学校", value: "10" },
          { label: "教研活动", value: "20" },
          { label: "参与教师", value: "120" },
        ],
      },
      {
        id: "alliance-science",
        title: "区域科学教育联盟",
        statusLabel: "使用中",
        statusTone: "success",
        createdAt: "2026-01-20 创建",
        adminName: "王芳",
        description: "覆盖初中科学与实验教学，推动优质实验课例共享与联合教研。",
        stats: [
          { label: "成员学校", value: "4" },
          { label: "教研活动", value: "12" },
          { label: "参与教师", value: "89" },
        ],
      },
      {
        id: "alliance-art",
        title: "艺术素养提升联盟",
        statusLabel: "使用中",
        statusTone: "success",
        createdAt: "2025-11-08 创建",
        adminName: "陈晓",
        description: "统筹音乐、美术跨校展示与教师研修，促进艺术教育资源互通。",
        stats: [
          { label: "成员学校", value: "5" },
          { label: "教研活动", value: "21" },
          { label: "参与教师", value: "164" },
        ],
      },
    ],
  };
}

export function effectEvaluationData(): WorkbenchEffectEvaluationData {
  return {
    kind: "effect-evaluation",
    actionLabel: "查看详情",
    metrics: [
      {
        id: "awards",
        title: "竞赛获奖（年度）",
        participating: { label: "参与校", displayValue: "42次", percentage: 78 },
        nonParticipating: { label: "未参与", displayValue: "12次", percentage: 22 },
      },
      {
        id: "papers",
        title: "论文发表（年度）",
        participating: { label: "参与校", displayValue: "35篇", percentage: 74 },
        nonParticipating: { label: "未参与", displayValue: "12篇", percentage: 26 },
      },
      {
        id: "certificates",
        title: "技能证书获取（年度）",
        participating: { label: "参与校", displayValue: "68本", percentage: 71 },
        nonParticipating: { label: "未参与", displayValue: "28本", percentage: 29 },
      },
    ],
    summary: {
      title: "竞赛获奖均值",
      unit: "次",
      participatingAverage: "8.25",
      participatingLabel: "参与校",
      nonParticipatingAverage: "2.25",
      nonParticipatingLabel: "未参与校",
      increasePercent: "267%",
      increaseLabel: "提升",
    },
  };
}

export function crossSchoolActivitiesData(): WorkbenchCrossSchoolActivitiesData {
  return {
    kind: "cross-school-activities",
    actionLabel: "查看全部",
    items: [
      {
        id: "activity-chinese",
        title: "跨校集体备课 · 小学语文三年级《富饶的西沙群岛》",
        statusLabel: "进行中",
        statusTone: "primary",
        meta: "城东学区 · 阳光小学牵头 · 2026-08-25",
      },
      {
        id: "activity-math",
        title: "跨校课例研讨 · 初中数学《一次函数》",
        statusLabel: "进行中",
        statusTone: "primary",
        meta: "城西学区 · 实验中学牵头 · 2026-08-20",
      },
      {
        id: "activity-science",
        title: "联合教研活动 · 科学实验教学专题",
        statusLabel: "已归档",
        statusTone: "success",
        meta: "区域联盟 · 科创小学牵头 · 2026-07-15",
      },
    ],
  };
}

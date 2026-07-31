export interface NationalStandardReference {
  key: string;
  level: "policy" | "guideline" | "national-standard";
  title: string;
  documentNumber?: string;
  issuedAt: string;
  status: string;
  appliesTo: string;
  url: string;
}

/**
 * 国家层面的现行政策与专项标准目录。
 *
 * 政策和评价指南只约束方向、维度与程序，不能被页面解释为统一计算公式。
 * `checkedAt` 用于提醒维护者定期复核标准状态。
 */
export const nationalStandardAlignment = {
  checkedAt: "2026-07-28",
  references: [
    {
      key: "education-evaluation-reform-2020",
      level: "policy",
      title: "深化新时代教育评价改革总体方案",
      issuedAt: "2020-10-13",
      status: "现行政策依据",
      appliesTo: "改进结果评价、强化过程评价、探索增值评价、健全综合评价",
      url: "https://www.moe.gov.cn/jyb_xxgk/moe_1777/moe_1778/202010/t20201013_494381.html",
    },
    {
      key: "compulsory-quality-guide-2021",
      level: "guideline",
      title: "义务教育质量评价指南",
      issuedAt: "2021-03-17",
      status: "现行评价指南",
      appliesTo: "品德、学业、身心、审美、劳动与社会实践五类学生发展质量",
      url: "https://www.moe.gov.cn/srcsite/A06/s3321/202103/t20210317_520238.html",
    },
    {
      key: "high-school-quality-guide-2021",
      level: "guideline",
      title: "普通高中学校办学质量评价指南",
      documentNumber: "教基〔2021〕9号",
      issuedAt: "2021-12-31",
      status: "现行评价指南",
      appliesTo: "高中办学质量与学生德智体美劳全面发展评价",
      url: "https://www.moe.gov.cn/srcsite/A06/s3732/202201/t20220107_593059.html",
    },
    {
      key: "student-fitness-2014",
      level: "guideline",
      title: "国家学生体质健康标准（2014年修订）",
      issuedAt: "2014-07-07",
      status: "现行体质健康测试依据",
      appliesTo: "学生体质健康项目、权重、年级和等级评价",
      url: "https://www.moe.gov.cn/s78/A17/twys_left/moe_938/moe_792/s3273/201407/t20140708_171692.html",
    },
    {
      key: "basic-athletic-ability-2024",
      level: "national-standard",
      title: "学生基本运动能力测评规范",
      documentNumber: "GB/T 44099-2024",
      issuedAt: "2024-05-28",
      status: "现行推荐性国家标准",
      appliesTo: "学生基本运动能力测评",
      url: "https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=B9B5F3762CBE7B8951A46C072CCBE4D4",
    },
    {
      key: "information-literacy-2023",
      level: "national-standard",
      title: "中小学生信息素养评价指南",
      documentNumber: "GB/T 43466-2023",
      issuedAt: "2023-12-28",
      status: "现行推荐性国家标准",
      appliesTo: "中小学生信息素养专项评价",
      url: "https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=6083A2042229BFBBD4247A96708358C2",
    },
  ] satisfies NationalStandardReference[],
} as const;

export const regionalPortraitNationalDimensions = [
  { key: "moral", label: "品德发展", evidence: "五育评价、日常评价、志愿与社会责任事实记录" },
  { key: "academic", label: "学业发展", evidence: "课程修习、统考得分率、标准分变化与学科能力" },
  { key: "health", label: "身心发展", evidence: "国家体质健康测试、基本运动能力与体育活动记录" },
  { key: "aesthetic", label: "审美素养", evidence: "美育课程、艺术实践与经审核成果记录" },
  { key: "labor-practice", label: "劳动与社会实践", evidence: "劳动、社团、志愿和社会实践有效参与记录" },
] as const;

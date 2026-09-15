import type {
  AllianceMemberSchool,
  SchoolOption,
  SchoolStage,
  TeacherOption,
  TeachingResearchAllianceCreateInput,
  TeachingResearchAllianceDetail,
  TeachingResearchAllianceRow,
  TeachingResearchAllianceStats,
} from "@/features/teaching-research-alliance/types";
import { SCHOOL_STAGE_LABEL } from "@/features/teaching-research-alliance/types";

export const ALLIANCE_SCHOOL_OPTIONS: readonly SchoolOption[] = [
  { id: "school-sunshine", name: "阳光小学", stage: "primary", district: "东片区" },
  { id: "school-yucai", name: "育才中学", stage: "middle", district: "东片区" },
  { id: "school-wende", name: "文德小学", stage: "primary", district: "西片区" },
  { id: "school-experiment", name: "实验学校", stage: "nine-year", district: "中心片区" },
  { id: "school-chunfeng", name: "春风小学", stage: "primary", district: "西片区" },
  { id: "school-xinghai", name: "星海中学", stage: "middle", district: "中心片区" },
  { id: "school-cuizhu", name: "翠竹小学", stage: "primary", district: "东片区" },
  { id: "school-shuxiang", name: "书香中学", stage: "middle", district: "西片区" },
  { id: "school-chenxi", name: "晨曦小学", stage: "primary", district: "中心片区" },
  { id: "school-lvye", name: "绿叶中学", stage: "middle", district: "东片区" },
  { id: "school-kechuang", name: "科创小学", stage: "primary", district: "东片区" },
  { id: "school-xinghu", name: "星湖小学", stage: "nine-year", district: "西片区" },
];

export const ALLIANCE_TEACHER_OPTIONS: readonly TeacherOption[] = [
  { id: "teacher-chenhaodong", name: "陈豪东", schoolId: "school-sunshine", subject: "语文", roleLabel: "高级教师" },
  { id: "teacher-liminghua", name: "李明华", schoolId: "school-sunshine", subject: "数学", roleLabel: "教研组长" },
  { id: "teacher-zhoumin", name: "周敏", schoolId: "school-sunshine", subject: "英语", roleLabel: "教师" },
  { id: "teacher-lianglu", name: "梁璐", schoolId: "school-yucai", subject: "语文", roleLabel: "教师" },
  { id: "teacher-zhangwei", name: "张伟", schoolId: "school-yucai", subject: "数学", roleLabel: "备课组长" },
  { id: "teacher-hewenqing", name: "何文清", schoolId: "school-yucai", subject: "英语", roleLabel: "教师" },
  { id: "teacher-wangfang", name: "王芳", schoolId: "school-wende", subject: "语文", roleLabel: "教师" },
  { id: "teacher-zhaozixuan", name: "赵子轩", schoolId: "school-wende", subject: "数学", roleLabel: "教师" },
  { id: "teacher-liuchen", name: "刘晨", schoolId: "school-wende", subject: "科学", roleLabel: "教研组长" },
  { id: "teacher-sunyue", name: "孙越", schoolId: "school-experiment", subject: "语文", roleLabel: "高级教师" },
  { id: "teacher-wuting", name: "吴婷", schoolId: "school-experiment", subject: "数学", roleLabel: "教师" },
  { id: "teacher-zhengkai", name: "郑凯", schoolId: "school-experiment", subject: "物理", roleLabel: "教师" },
  { id: "teacher-fangqing", name: "方晴", schoolId: "school-chunfeng", subject: "语文", roleLabel: "教师" },
  { id: "teacher-yangjie", name: "杨杰", schoolId: "school-chunfeng", subject: "数学", roleLabel: "教研组长" },
  { id: "teacher-taoran", name: "陶然", schoolId: "school-xinghai", subject: "语文", roleLabel: "教师" },
  { id: "teacher-gaohang", name: "高航", schoolId: "school-xinghai", subject: "数学", roleLabel: "教师" },
  { id: "teacher-jiangning", name: "蒋宁", schoolId: "school-cuizhu", subject: "语文", roleLabel: "教师" },
  { id: "teacher-gufan", name: "顾凡", schoolId: "school-cuizhu", subject: "数学", roleLabel: "教师" },
  { id: "teacher-baixue", name: "白雪", schoolId: "school-shuxiang", subject: "语文", roleLabel: "教师" },
  { id: "teacher-hanfeng", name: "韩峰", schoolId: "school-shuxiang", subject: "数学", roleLabel: "教研组长" },
  { id: "teacher-xunuo", name: "许诺", schoolId: "school-chenxi", subject: "语文", roleLabel: "教师" },
  { id: "teacher-dengbo", name: "邓博", schoolId: "school-chenxi", subject: "数学", roleLabel: "教师" },
  { id: "teacher-chengyuan", name: "程远", schoolId: "school-lvye", subject: "语文", roleLabel: "教师" },
  { id: "teacher-guxue", name: "顾雪", schoolId: "school-lvye", subject: "数学", roleLabel: "教师" },
  { id: "teacher-chenxiao", name: "陈晓", schoolId: "school-kechuang", subject: "科学", roleLabel: "教师" },
  { id: "teacher-wulei", name: "吴磊", schoolId: "school-xinghu", subject: "语文", roleLabel: "教师" },
];

function schoolName(id: string) {
  return ALLIANCE_SCHOOL_OPTIONS.find((school) => school.id === id)?.name ?? id;
}

function teacherName(id: string) {
  return ALLIANCE_TEACHER_OPTIONS.find((teacher) => teacher.id === id)?.name ?? id;
}

function schoolStage(id: string): SchoolStage {
  return ALLIANCE_SCHOOL_OPTIONS.find((school) => school.id === id)?.stage ?? "primary";
}

export function summarizeAllianceStats(
  details: readonly TeachingResearchAllianceDetail[],
): TeachingResearchAllianceStats {
  const schoolIds = new Set<string>();
  let activityCount = 0;
  let teacherCount = 0;
  for (const item of details) {
    for (const school of item.memberSchools) schoolIds.add(school.id);
    activityCount += item.activityCount;
    teacherCount += item.teacherCount;
  }
  return {
    allianceCount: details.length,
    schoolCount: schoolIds.size,
    activityCount,
    teacherCount,
  };
}

function toListRow(detail: TeachingResearchAllianceDetail): TeachingResearchAllianceRow {
  const { memberSchools, ...row } = detail;
  return {
    id: row.id,
    name: row.name,
    leadSchoolId: row.leadSchoolId,
    leadSchoolName: row.leadSchoolName,
    memberSchoolCount: row.memberSchoolCount,
    activityCount: row.activityCount,
    teacherCount: row.teacherCount,
    adminId: row.adminId,
    adminName: row.adminName,
    status: row.status,
    spaceName: row.spaceName,
    memberSchoolNames: memberSchools.map((school) => school.name),
    createdAt: row.createdAt,
  };
}

function createSeedDetails(): TeachingResearchAllianceDetail[] {
  const seeds: TeachingResearchAllianceDetail[] = [
    {
      id: "alliance-east",
      name: "城东学区教研联盟",
      leadSchoolId: "school-sunshine",
      leadSchoolName: "阳光小学",
      memberSchoolCount: 6,
      activityCount: 18,
      teacherCount: 126,
      adminId: "teacher-liminghua",
      adminName: "李明华",
      status: "active",
      spaceName: "城东学区教研联盟空间",
      memberSchoolNames: [],
      createdAt: "2026-03-15",
      description: "城东学区六校联合，以小学语文、初中数学为突破口开展跨校教研。",
      memberSchools: [
        { id: "school-sunshine", name: "阳光小学", stage: "primary", role: "lead", teacherCount: 12, activityCount: 4 },
        { id: "school-yucai", name: "育才中学", stage: "middle", role: "member", teacherCount: 31, activityCount: 1 },
        { id: "school-experiment", name: "实验学校", stage: "nine-year", role: "member", teacherCount: 14, activityCount: 2 },
        { id: "school-wende", name: "文德小学", stage: "primary", role: "member", teacherCount: 18, activityCount: 3 },
        { id: "school-kechuang", name: "科创小学", stage: "primary", role: "member", teacherCount: 22, activityCount: 5 },
        { id: "school-xinghu", name: "星湖小学", stage: "nine-year", role: "member", teacherCount: 29, activityCount: 3 },
      ],
      space: { title: "城东学区专属空间", documentCount: 12, topicCount: 8, fileCount: 23 },
      documents: [
        {
          id: "doc-xisha",
          title: "《富饶的西沙群岛》集体备课文档",
          allianceName: "城东学区教研联盟",
          lastEditedAt: "2026-08-24 16:30",
          status: "editing",
          editors: ["梁", "王"],
        },
        {
          id: "doc-gougu",
          title: "勾股定理分层练习设计",
          allianceName: "南山教育集团教研共同体",
          lastEditedAt: "2026-08-22 11:20",
          status: "editing",
          editors: ["钱"],
        },
        {
          id: "doc-english",
          title: "英语阅读教学策略研究",
          allianceName: "城东学区教研联盟",
          lastEditedAt: "2026-08-18 09:45",
          status: "finalized",
          editors: ["卓", "杨"],
        },
        {
          id: "doc-science",
          title: "科学实验资源包方案",
          allianceName: "西湖片区小学教研联盟",
          lastEditedAt: "2026-08-15 14:10",
          status: "editing",
          editors: ["刘"],
        },
        {
          id: "doc-template",
          title: "跨校教研活动总结模板",
          allianceName: "通用",
          lastEditedAt: "2026-08-10 17:00",
          status: "finalized",
          editors: [],
        },
      ],
      discussions: [
        {
          id: "disc-reading",
          title: "小学语文阅读理解如何分层指导",
          allianceName: "城东学区教研联盟",
          initiatorName: "陈豪东",
          initiatorSchool: "阳光小学",
          replyCount: 12,
          lastRepliedAt: "2026-08-24 15:30",
          status: "hot",
        },
        {
          id: "disc-exam",
          title: "初中数学中考复习策略跨校研讨",
          allianceName: "南山教育集团教研共同体",
          initiatorName: "张伟",
          initiatorSchool: "育才中学",
          replyCount: 8,
          lastRepliedAt: "2026-08-23 10:15",
          status: "hot",
        },
        {
          id: "disc-oral",
          title: "英语口语训练的跨校合作模式",
          allianceName: "城东学区教研联盟",
          initiatorName: "赵雅芝",
          initiatorSchool: "实验学校",
          replyCount: 5,
          lastRepliedAt: "2026-08-20 14:00",
          status: "summarized",
        },
        {
          id: "disc-safety",
          title: "科学实验课安全问题讨论",
          allianceName: "西湖片区小学教研联盟",
          initiatorName: "孙美琪",
          initiatorSchool: "翠竹小学",
          replyCount: 3,
          lastRepliedAt: "2026-08-18 16:20",
          status: "discussing",
        },
      ],
      performance: { participationRate: 88, outputRate: 72 },
      activities: [
        {
          id: "activity-chinese",
          name: "跨校集体备课·小学语文三年级《富饶的西沙群岛》",
          typeLabel: "集体备课",
          scheduledAt: "2026-08-25 14:00",
          leadSchoolName: "阳光小学",
          status: "ongoing",
        },
        {
          id: "activity-math",
          name: "跨校课例研讨·初中数学《一次函数》",
          typeLabel: "课例研讨",
          scheduledAt: "2026-07-18 09:30",
          leadSchoolName: "育才中学",
          status: "archived",
        },
      ],
    },
    {
      id: "alliance-nanshan",
      name: "南山教育集团教研共同体",
      leadSchoolId: "school-yucai",
      leadSchoolName: "育才中学",
      memberSchoolCount: 8,
      activityCount: 24,
      teacherCount: 185,
      adminId: "teacher-zhangwei",
      adminName: "张伟",
      status: "active",
      spaceName: "南山教育集团教研共同体空间",
      memberSchoolNames: [],
      createdAt: "2026-05-18",
      description: "覆盖集团内中小学，推进跨校联合备课、课例研讨与资源共建。",
      memberSchools: [
        { id: "school-yucai", name: "育才中学", stage: "middle", role: "lead", teacherCount: 36, activityCount: 6 },
        { id: "school-experiment", name: "实验学校", stage: "nine-year", role: "member", teacherCount: 28, activityCount: 4 },
        { id: "school-lvye", name: "绿叶中学", stage: "middle", role: "member", teacherCount: 24, activityCount: 3 },
        { id: "school-sunshine", name: "阳光小学", stage: "primary", role: "member", teacherCount: 20, activityCount: 2 },
        { id: "school-wende", name: "文德小学", stage: "primary", role: "member", teacherCount: 18, activityCount: 2 },
        { id: "school-kechuang", name: "科创小学", stage: "primary", role: "member", teacherCount: 22, activityCount: 3 },
        { id: "school-chenxi", name: "晨曦小学", stage: "primary", role: "member", teacherCount: 19, activityCount: 2 },
        { id: "school-xinghu", name: "星湖小学", stage: "nine-year", role: "member", teacherCount: 18, activityCount: 2 },
      ],
      space: { title: "南山教育集团专属空间", documentCount: 21, topicCount: 15, fileCount: 36 },
      documents: [],
      discussions: [],
      performance: { participationRate: 91, outputRate: 78 },
      activities: [
        {
          id: "activity-science",
          name: "联合教研活动·科学实验教学专题",
          typeLabel: "联合教研",
          scheduledAt: "2026-08-12 15:00",
          leadSchoolName: "育才中学",
          status: "ongoing",
        },
      ],
    },
    {
      id: "alliance-westlake",
      name: "西湖片区小学教研联盟",
      leadSchoolId: "school-wende",
      leadSchoolName: "文德小学",
      memberSchoolCount: 5,
      activityCount: 9,
      teacherCount: 68,
      adminId: "teacher-wangfang",
      adminName: "王芳",
      status: "disabled",
      spaceName: "西湖片区小学教研联盟空间",
      memberSchoolNames: [],
      createdAt: "2025-11-03",
      description: "聚焦小学语文与数学常态化跨校教研，当前已暂停新活动安排。",
      memberSchools: [
        { id: "school-wende", name: "文德小学", stage: "primary", role: "lead", teacherCount: 16, activityCount: 3 },
        { id: "school-sunshine", name: "阳光小学", stage: "primary", role: "member", teacherCount: 14, activityCount: 2 },
        { id: "school-xinghu", name: "星湖小学", stage: "nine-year", role: "member", teacherCount: 12, activityCount: 1 },
        { id: "school-kechuang", name: "科创小学", stage: "primary", role: "member", teacherCount: 15, activityCount: 2 },
        { id: "school-chunfeng", name: "春风小学", stage: "primary", role: "member", teacherCount: 11, activityCount: 1 },
      ],
      space: { title: "西湖片区专属空间", documentCount: 7, topicCount: 4, fileCount: 11 },
      documents: [],
      discussions: [],
      performance: { participationRate: 64, outputRate: 51 },
      activities: [],
    },
  ];
  return seeds.map((detail) => ({
    ...detail,
    memberSchoolNames: detail.memberSchools.map((school) => school.name),
  }));
}

function buildMemberSchools(
  leadSchoolId: string,
  memberSchoolIds: readonly string[],
): AllianceMemberSchool[] {
  const ids = Array.from(new Set([leadSchoolId, ...memberSchoolIds]));
  return ids.map((id) => ({
    id,
    name: schoolName(id),
    stage: schoolStage(id),
    role: id === leadSchoolId ? "lead" : "member",
    teacherCount: 0,
    activityCount: 0,
  }));
}

let alliances = createSeedDetails();

export function resetAllianceMockData() {
  alliances = createSeedDetails();
}

export function listAllianceMockRows() {
  return alliances.map((detail) => toListRow(detail));
}

export function summarizeAllianceMockStats() {
  return summarizeAllianceStats(alliances);
}

export function getAllianceMockDetail(id: string) {
  const detail = alliances.find((item) => item.id === id);
  if (!detail) return undefined;
  return {
    ...detail,
    memberSchoolNames: detail.memberSchools.map((school) => school.name),
    memberSchools: detail.memberSchools.map((school) => ({ ...school })),
    space: { ...detail.space },
    documents: detail.documents.map((document) => ({
      ...document,
      editors: [...document.editors],
    })),
    discussions: detail.discussions.map((discussion) => ({ ...discussion })),
    performance: { ...detail.performance },
    activities: detail.activities.map((activity) => ({ ...activity })),
  };
}

export function createAllianceMockRow(
  input: TeachingResearchAllianceCreateInput,
): TeachingResearchAllianceRow {
  const name = input.name.trim();
  const memberSchools = buildMemberSchools(input.leadSchoolId, input.memberSchoolIds);
  const detail: TeachingResearchAllianceDetail = {
    id: `alliance-${crypto.randomUUID()}`,
    name,
    leadSchoolId: input.leadSchoolId,
    leadSchoolName: schoolName(input.leadSchoolId),
    memberSchoolCount: memberSchools.length,
    activityCount: 0,
    teacherCount: input.teacherIds.length,
    adminId: input.adminId,
    adminName: teacherName(input.adminId),
    status: "active",
    spaceName: `${name}空间`,
    memberSchoolNames: memberSchools.map((school) => school.name),
    createdAt: new Date().toISOString().slice(0, 10),
    description:
      input.description.trim() ||
      "教育局新建跨校教研联盟，可在专属空间开展文档协作与研讨。",
    memberSchools,
    space: {
      title: `${name}专属空间`,
      documentCount: 0,
      topicCount: 0,
      fileCount: 0,
    },
    documents: [],
    discussions: [],
    performance: { participationRate: 0, outputRate: 0 },
    activities: [],
  };
  alliances = [detail, ...alliances];
  return toListRow(detail);
}

export function setAllianceMockStatus(id: string, status: TeachingResearchAllianceRow["status"]) {
  const index = alliances.findIndex((item) => item.id === id);
  const current = alliances[index];
  if (!current) return false;
  alliances[index] = { ...current, status };
  return true;
}

export function schoolStageLabel(stage: SchoolStage) {
  return SCHOOL_STAGE_LABEL[stage];
}

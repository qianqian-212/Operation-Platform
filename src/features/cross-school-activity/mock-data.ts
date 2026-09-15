import {
  ALLIANCE_SCHOOL_OPTIONS,
  ALLIANCE_TEACHER_OPTIONS,
  listAllianceMockRows,
} from "@/features/teaching-research-alliance/mock-data";
import {
  createEmptyObservation,
  type ActivityAllianceOption,
  type ActivityArchiveItem,
  type ActivityDiscussion,
  type ActivityLessonTopic,
  type ActivityObservation,
  type ActivityParticipant,
  type ActivityTask,
  type ActivityTaskKind,
  type ActivityTaskStatus,
  type ActivityVote,
  type CrossSchoolActivityCreateInput,
  type CrossSchoolActivityDetail,
  type CrossSchoolActivityRow,
} from "@/features/cross-school-activity/types";

function schoolName(id: string) {
  return ALLIANCE_SCHOOL_OPTIONS.find((school) => school.id === id)?.name ?? id;
}

function teacherName(id: string) {
  return ALLIANCE_TEACHER_OPTIONS.find((teacher) => teacher.id === id)?.name ?? id;
}

function teacherSchoolId(id: string) {
  return ALLIANCE_TEACHER_OPTIONS.find((teacher) => teacher.id === id)?.schoolId ?? "";
}

function toListRow(detail: CrossSchoolActivityDetail): CrossSchoolActivityRow {
  return {
    id: detail.id,
    name: detail.name,
    type: detail.type,
    scheduledAt: detail.scheduledAt,
    leadSchoolId: detail.leadSchoolId,
    leadSchoolName: detail.leadSchoolName,
    participantCount: detail.participantCount,
    schoolCount: detail.schoolCount,
    status: detail.status,
    allianceId: detail.allianceId,
    allianceName: detail.allianceName,
  };
}

function participant(
  id: string,
  name: string,
  schoolId: string,
  schoolNameValue: string,
): ActivityParticipant {
  return { id, name, schoolId, schoolName: schoolNameValue };
}

function task(
  id: string,
  name: string,
  ownerId: string,
  ownerName: string,
  schoolNameValue: string,
  kind: ActivityTaskKind,
  status: ActivityTaskStatus,
  latestFileName: string,
  latestSubmittedAt: string,
): ActivityTask {
  return {
    id,
    name,
    kind,
    status,
    ownerId,
    ownerName,
    schoolName: schoolNameValue,
    latestFileName,
    latestSubmittedAt,
  };
}

function discussion(
  id: string,
  title: string,
  initiatorName: string,
  initiatorSchool: string,
  replyCount: number,
  lastRepliedAt: string,
  status: ActivityDiscussion["status"],
): ActivityDiscussion {
  return { id, title, initiatorName, initiatorSchool, replyCount, lastRepliedAt, status };
}

function archive(
  id: string,
  title: string,
  kind: ActivityArchiveItem["kind"],
  createdAt: string,
  authorName: string,
): ActivityArchiveItem {
  return { id, title, kind, createdAt, authorName };
}

function vote(id: string, title: string, options: ActivityVote["options"]): ActivityVote {
  return { id, title, options };
}

function chinesePrepTopic(): ActivityLessonTopic {
  return {
    stage: "小学",
    subject: "语文",
    grade: "三年级",
    title: "富饶的西沙群岛",
    period: "2课时",
    textbookVersion: "统编版",
    chapter: "第一单元",
  };
}

function chinesePrepDetail(): CrossSchoolActivityDetail {
  return {
    id: "activity-chinese",
    name: "跨校集体备课·小学语文三年级《富饶的西沙群岛》",
    type: "lesson-prep",
    scheduledAt: "2026-08-09 12:00",
    leadSchoolId: "school-sunshine",
    leadSchoolName: "阳光小学",
    participantCount: 9,
    schoolCount: 5,
    status: "ongoing",
    allianceId: "alliance-east",
    allianceName: "城东学区教研联盟",
    location: "阳光小学·教研楼302（线上同步）",
    initiatorId: "teacher-chenhaodong",
    initiatorName: "陈豪东",
    description: "围绕三年级语文《富饶的西沙群岛》开展跨校集体备课，重点研讨课文理解和仿写训练。",
    participants: [
      participant("teacher-chenhaodong", "陈豪东", "school-sunshine", "阳光小学"),
      participant("teacher-liminghua", "李明华", "school-sunshine", "阳光小学"),
      participant("teacher-zhoumin", "周敏", "school-sunshine", "阳光小学"),
      participant("teacher-lianglu", "梁璐", "school-yucai", "育才中学"),
      participant("teacher-hewenqing", "何文清", "school-yucai", "育才中学"),
      participant("teacher-wangfang", "王芳", "school-wende", "文德小学"),
      participant("teacher-zhaozixuan", "赵子轩", "school-wende", "文德小学"),
      participant("teacher-fangqing", "方晴", "school-chunfeng", "春风小学"),
      participant("teacher-wulei", "吴磊", "school-xinghu", "星湖小学"),
    ],
    topic: chinesePrepTopic(),
    tasks: [
      task(
        "task-plan",
        "主备教案·第一课时",
        "teacher-chenhaodong",
        "陈豪东",
        "阳光小学",
        "file",
        "final",
        "《富饶的西沙群岛》教案v1.0.docx",
        "2026-08-22 16:30",
      ),
      task(
        "task-slides",
        "主备教案·第一课时",
        "teacher-chenhaodong",
        "陈豪东",
        "阳光小学",
        "text",
        "pending",
        "《富饶的西沙群岛》教案v1.0.docx",
        "2026-08-22 16:30",
      ),
      task(
        "task-exercise",
        "主备教案·第一课时",
        "teacher-chenhaodong",
        "陈豪东",
        "阳光小学",
        "text",
        "pending",
        "《富饶的西沙群岛》教案v1.0.docx",
        "2026-08-22 16:30",
      ),
    ],
    observation: null,
    discussions: [
      discussion("disc-reading", "小学语文阅读理解如何分层指导", "陈豪东", "阳光小学", 12, "2026-08-24 15:30", "hot"),
      discussion("disc-writing", "课后写景片段训练如何布置", "王芳", "文德小学", 6, "2026-08-24 11:20", "discussing"),
    ],
    votes: [
      vote("vote-intro", "本课导入方式", [
        { id: "opt-scene", label: "情境导入", count: 8 },
        { id: "opt-question", label: "问题导入", count: 5 },
      ]),
    ],
    archives: [
      archive("arch-reflect", "第一次集体备课反思", "reflection", "2026-08-25 16:20", "陈豪东"),
      archive("arch-output", "《富饶的西沙群岛》共建教案", "output", "2026-08-25 17:00", "梁璐"),
    ],
  };
}

function mathObservation(): ActivityObservation {
  return {
    ...createEmptyObservation(),
    courseName: "勾股定理",
    instructorId: "teacher-zhangwei",
    instructorName: "张伟",
    scheduledAt: "2026-08-22 09:00",
    method: "线下听课",
    grade: "八年级",
    subject: "数学",
    courseType: "新授课",
    reviewerId: "teacher-gaohang",
    reviewerName: "高航",
    reviewMethod: "线下评课",
    assessmentTemplate: "初中数学评课模板",
    materials: [{ id: "mat-gougu", name: "勾股定理课件.pptx", sizeLabel: "2.1MB" }],
  };
}

function mathObservationDetail(): CrossSchoolActivityDetail {
  return {
    id: "activity-gougu",
    name: "跨校听评课·初中数学《勾股定理》",
    type: "lesson-observation",
    scheduledAt: "2026-08-22 09:00",
    leadSchoolId: "school-yucai",
    leadSchoolName: "育才中学",
    participantCount: 3,
    schoolCount: 3,
    status: "ongoing",
    allianceId: "alliance-nanshan",
    allianceName: "南山教育集团教研共同体",
    location: "育才中学·博学楼208",
    initiatorId: "teacher-zhangwei",
    initiatorName: "张伟",
    description: "围绕八年级《勾股定理》开展跨校听评课，重点观察问题驱动与分层练习设计。",
    participants: [
      participant("teacher-zhangwei", "张伟", "school-yucai", "育才中学"),
      participant("teacher-gaohang", "高航", "school-xinghai", "星海中学"),
      participant("teacher-hanfeng", "韩峰", "school-shuxiang", "书香中学"),
    ],
    topic: null,
    tasks: [],
    observation: mathObservation(),
    discussions: [
      discussion("disc-proof", "勾股定理证明路径如何分层呈现", "张伟", "育才中学", 7, "2026-08-22 11:10", "hot"),
    ],
    votes: [
      vote("vote-proof", "更适合本课的证明引入", [
        { id: "opt-geom", label: "几何拼图", count: 6 },
        { id: "opt-algebra", label: "代数推导", count: 2 },
      ]),
    ],
    archives: [
      archive("arch-math-note", "听课记录汇总", "output", "2026-08-22 16:00", "高航"),
    ],
  };
}

function englishPrepDetail(): CrossSchoolActivityDetail {
  return {
    id: "activity-english",
    name: "跨校集体备课·小学英语阅读教学",
    type: "lesson-prep",
    scheduledAt: "2026-08-20 14:00",
    leadSchoolId: "school-experiment",
    leadSchoolName: "实验学校",
    participantCount: 3,
    schoolCount: 3,
    status: "archived",
    allianceId: "alliance-east",
    allianceName: "城东学区教研联盟",
    location: "实验学校·外语教研室",
    initiatorId: "teacher-zhoumin",
    initiatorName: "周敏",
    description: "围绕小学英语阅读课，共建可复用的文本解读与口语输出任务。",
    participants: [
      participant("teacher-zhoumin", "周敏", "school-sunshine", "阳光小学"),
      participant("teacher-hewenqing", "何文清", "school-yucai", "育才中学"),
      participant("teacher-sunyue", "孙越", "school-experiment", "实验学校"),
    ],
    topic: {
      stage: "小学",
      subject: "英语",
      grade: "四年级",
      title: "阅读教学策略研讨",
      period: "1课时",
      textbookVersion: "人教版",
      chapter: "第二单元",
    },
    tasks: [
      task(
        "task-text",
        "文本解读",
        "teacher-sunyue",
        "孙越",
        "实验学校",
        "file",
        "final",
        "英语阅读解读稿.docx",
        "2026-08-20 16:00",
      ),
      task(
        "task-oral",
        "口语任务设计",
        "teacher-zhoumin",
        "周敏",
        "阳光小学",
        "text",
        "pending",
        "口语任务单.docx",
        "2026-08-20 15:10",
      ),
    ],
    observation: null,
    discussions: [
      discussion("disc-oral", "英语口语训练的跨校合作模式", "周敏", "阳光小学", 5, "2026-08-20 16:00", "summarized"),
    ],
    votes: [],
    archives: [
      archive("arch-english", "英语阅读教学策略研究", "output", "2026-08-20 17:30", "孙越"),
      archive("arch-english-reflect", "活动复盘", "reflection", "2026-08-21 09:10", "周敏"),
    ],
  };
}

function scienceObservationDetail(): CrossSchoolActivityDetail {
  return {
    id: "activity-science-obs",
    name: "跨校听评课·小学科学实验课",
    type: "lesson-observation",
    scheduledAt: "2026-08-18 14:00",
    leadSchoolId: "school-cuizhu",
    leadSchoolName: "翠竹小学",
    participantCount: 2,
    schoolCount: 2,
    status: "ongoing",
    allianceId: "alliance-westlake",
    allianceName: "西湖片区小学教研联盟",
    location: "翠竹小学·科学实验室",
    initiatorId: "teacher-jiangning",
    initiatorName: "蒋宁",
    description: "观察小学科学实验课的安全组织、探究提问与记录指导。",
    participants: [
      participant("teacher-jiangning", "蒋宁", "school-cuizhu", "翠竹小学"),
      participant("teacher-liuchen", "刘晨", "school-wende", "文德小学"),
    ],
    topic: null,
    tasks: [],
    observation: {
      ...createEmptyObservation(),
      courseName: "观察水的浮力",
      instructorId: "teacher-jiangning",
      instructorName: "蒋宁",
      scheduledAt: "2026-08-18 14:00",
      method: "线下听课",
      grade: "四年级",
      subject: "科学",
      courseType: "实验课",
      reviewerId: "teacher-liuchen",
      reviewerName: "刘晨",
      reviewMethod: "线下评课",
      assessmentTemplate: "跨校听评课量表（通用）",
      materials: [{ id: "mat-science", name: "浮力实验记录表.docx", sizeLabel: "186K" }],
    },
    discussions: [
      discussion("disc-safety", "科学实验课安全问题讨论", "蒋宁", "翠竹小学", 3, "2026-08-18 16:20", "discussing"),
    ],
    votes: [],
    archives: [],
  };
}

function createSeedDetails(): CrossSchoolActivityDetail[] {
  return [
    chinesePrepDetail(),
    mathObservationDetail(),
    englishPrepDetail(),
    scienceObservationDetail(),
  ];
}

function cloneDetail(detail: CrossSchoolActivityDetail): CrossSchoolActivityDetail {
  return {
    ...detail,
    participants: detail.participants.map((item) => ({ ...item })),
    topic: detail.topic ? { ...detail.topic } : null,
    tasks: detail.tasks.map((item) => ({ ...item })),
    observation: detail.observation ? normalizeObservation(detail.observation) : null,
    discussions: detail.discussions.map((item) => ({ ...item })),
    votes: detail.votes.map((item) => ({
      ...item,
      options: item.options.map((option) => ({ ...option })),
    })),
    archives: detail.archives.map((item) => ({ ...item })),
  };
}

function buildParticipants(teacherIds: readonly string[]): ActivityParticipant[] {
  return teacherIds.map((id) => {
    const schoolId = teacherSchoolId(id);
    return participant(id, teacherName(id), schoolId, schoolName(schoolId));
  });
}

function normalizeObservation(input: ActivityObservation): ActivityObservation {
  return {
    ...createEmptyObservation(),
    ...input,
    materials: (input.materials ?? []).map((item) => ({ ...item })),
  };
}

function primaryAssigneeId(item: CrossSchoolActivityCreateInput["tasks"][number]) {
  const lead = item.assignees.find((assignee) => assignee.role === "lead");
  return lead?.teacherId ?? item.assignees[0]?.teacherId ?? "";
}

function buildTasks(input: CrossSchoolActivityCreateInput): ActivityTask[] {
  return input.tasks
    .filter((item) => item.name.trim())
    .map((item, index) => {
      const ownerId = primaryAssigneeId(item);
      return task(
        item.id || `task-${index + 1}`,
        item.name.trim(),
        ownerId,
        teacherName(ownerId),
        schoolName(teacherSchoolId(ownerId)),
        item.requireFile ? "file" : "text",
        "pending",
        "",
        "",
      );
    });
}

function resolveAllianceName(allianceId: string) {
  if (!allianceId) return "未归属联盟";
  return listAllianceMockRows().find((row) => row.id === allianceId)?.name ?? "未归属联盟";
}

let activities = createSeedDetails();

export function resetActivityMockData() {
  activities = createSeedDetails();
}

export function listActivityMockRows() {
  return activities.map((detail) => toListRow(detail));
}

export function getActivityMockDetail(id: string) {
  const detail = activities.find((item) => item.id === id);
  return detail ? cloneDetail(detail) : undefined;
}

export function listActivityAllianceOptions(): ActivityAllianceOption[] {
  return listAllianceMockRows()
    .filter((row) => row.status === "active")
    .map((row) => ({ id: row.id, name: row.name }));
}

export function saveActivityObservation(id: string, observation: ActivityObservation) {
  const current = activities.find((item) => item.id === id);
  if (!current) throw new Error("活动不存在");
  current.observation = normalizeObservation(observation);
  return cloneDetail(current);
}

export function createActivityMockRow(
  input: CrossSchoolActivityCreateInput,
): CrossSchoolActivityRow {
  const participants = buildParticipants(input.teacherIds);
  const schoolIds = new Set(input.memberSchoolIds);
  const detail: CrossSchoolActivityDetail = {
    id: `activity-${crypto.randomUUID()}`,
    name: input.name.trim(),
    type: input.type,
    scheduledAt: input.scheduledAt,
    leadSchoolId: input.leadSchoolId,
    leadSchoolName: schoolName(input.leadSchoolId),
    participantCount: participants.length,
    schoolCount: schoolIds.size,
    status: "ongoing",
    allianceId: input.allianceId,
    allianceName: resolveAllianceName(input.allianceId),
    location: input.location.trim(),
    initiatorId: input.teacherIds[0] ?? "",
    initiatorName: teacherName(input.teacherIds[0] ?? ""),
    description: input.description.trim(),
    participants,
    topic: (input.types ?? [input.type]).includes("lesson-prep") && input.topic ? { ...input.topic } : null,
    tasks: buildTasks(input),
    observation:
      (input.types ?? [input.type]).includes("lesson-observation") && input.observation
        ? normalizeObservation(input.observation)
        : null,
    discussions: [],
    votes: [],
    archives: [],
  };
  activities = [detail, ...activities];
  return toListRow(detail);
}

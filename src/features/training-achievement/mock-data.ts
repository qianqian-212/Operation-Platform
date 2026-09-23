import type {
  TrainingAchievementDetail,
  TrainingAchievementFormInput,
  TrainingAchievementRow,
  TrainingAchievementType,
} from "@/features/training-achievement/types";
import {
  resolveLevelLabel,
  resolveLevelScore,
  TRAINING_ACHIEVEMENT_BUREAU_OPTIONS,
} from "@/features/training-achievement/types";

function cloneDetail(detail: TrainingAchievementDetail): TrainingAchievementDetail {
  return {
    ...detail,
    attachments: detail.attachments.map((item) => ({ ...item })),
    auditRecords: detail.auditRecords.map((item) => ({ ...item })),
  };
}

function toRow(detail: TrainingAchievementDetail): TrainingAchievementRow {
  return {
    id: detail.id,
    code: detail.code,
    title: detail.title,
    bureauName: detail.bureauName,
    semester: detail.semester,
    type: detail.type,
    levelLabel: detail.levelLabel,
    submittedAt: detail.submittedAt,
    status: detail.status,
    earnedCredits: detail.earnedCredits,
  };
}

const seedDetails: TrainingAchievementDetail[] = [
  {
    id: "ach-001",
    code: "YX2026090015",
    title: "基于核心素养的单元整体教学研究",
    bureauName: "XX区教育局",
    semester: "2026-fall",
    type: "teaching-result",
    levelLabel: "市级 / 二等",
    submittedAt: "2026-09-10",
    status: "district-reviewing",
    earnedCredits: null,
    teacherName: "张三",
    schoolName: "实验小学",
    subject: "语文",
    stage: "小学",
    declaredScore: 8,
    abstract:
      "本研究围绕小学语文核心素养，探索单元整体教学的目标统整、任务设计与评价反馈路径，形成可迁移的教学案例与课例资源，服务区域校本研修与课堂改进。",
    attachments: [
      {
        id: "att-001",
        kind: "report",
        name: "成果研究报告_张三.docx",
        sizeLabel: "2.4 MB",
        mimeHint: "word",
      },
      {
        id: "att-002",
        kind: "certificate",
        name: "市级教学成果证明.pdf",
        sizeLabel: "856 KB",
        mimeHint: "pdf",
      },
    ],
    auditRecords: [
      {
        id: "audit-001",
        title: "学校初审 - 通过",
        occurredAt: "2026-09-12 09:15",
        actorLabel: "审核人：王校长 (实验小学)",
        comment: "同意推荐，案例选题贴合教学实际，具有一定参考价值。",
        tone: "success",
      },
      {
        id: "audit-002",
        title: "提交成果",
        occurredAt: "2026-09-10 16:42",
        actorLabel: "提交人：张三 (实验小学)",
        tone: "primary",
      },
    ],
  },
  {
    id: "ach-002",
    code: "YX2026080021",
    title: "2026年省级骨干教师培训结业",
    bureauName: "XX区教育局",
    semester: "2026-fall",
    type: "training",
    levelLabel: "省级",
    submittedAt: "2026-08-25",
    status: "approved",
    earnedCredits: 10,
    teacherName: "张三",
    schoolName: "实验小学",
    subject: "语文",
    stage: "小学",
    declaredScore: 10,
    abstract:
      "参加省级骨干教师培训，完成专题研修、课堂观摩与结业考核，形成个人研修总结与校本转化计划。",
    attachments: [
      {
        id: "att-003",
        kind: "certificate",
        name: "省级骨干教师培训结业证书.pdf",
        sizeLabel: "1.2 MB",
        mimeHint: "pdf",
      },
    ],
    auditRecords: [
      {
        id: "audit-003",
        title: "区级终审 - 通过",
        occurredAt: "2026-08-28 11:20",
        actorLabel: "审核人：李教研员 (XX区教育局)",
        comment: "材料齐全，学时与等级符合认定标准。",
        tone: "success",
      },
      {
        id: "audit-004",
        title: "学校初审 - 通过",
        occurredAt: "2026-08-26 10:05",
        actorLabel: "审核人：王校长 (实验小学)",
        tone: "success",
      },
      {
        id: "audit-005",
        title: "提交成果",
        occurredAt: "2026-08-25 15:30",
        actorLabel: "提交人：张三 (实验小学)",
        tone: "primary",
      },
    ],
  },
  {
    id: "ach-003",
    code: "YX2026080018",
    title: "小学语文情境教学实践研究",
    bureauName: "XX区教育局",
    semester: "2026-spring",
    type: "research-award",
    levelLabel: "市级 / 三等",
    submittedAt: "2026-08-12",
    status: "district-rejected",
    earnedCredits: null,
    teacherName: "张三",
    schoolName: "实验小学",
    subject: "语文",
    stage: "小学",
    declaredScore: 6,
    abstract:
      "围绕情境创设与语文学习活动设计开展实践研究，形成课堂案例与反思报告。区级审核认为佐证材料不完整，需补充获奖文件后重提。",
    attachments: [
      {
        id: "att-004",
        kind: "report",
        name: "情境教学实践研究报告.pdf",
        sizeLabel: "1.8 MB",
        mimeHint: "pdf",
      },
    ],
    auditRecords: [
      {
        id: "audit-006",
        title: "区级审核 - 驳回",
        occurredAt: "2026-08-20 14:10",
        actorLabel: "审核人：赵教研员 (XX区教育局)",
        comment: "缺少获奖证书扫描件，请补充后重新提交。",
        tone: "danger",
      },
      {
        id: "audit-007",
        title: "学校初审 - 通过",
        occurredAt: "2026-08-14 09:40",
        actorLabel: "审核人：王校长 (实验小学)",
        tone: "success",
      },
      {
        id: "audit-008",
        title: "提交成果",
        occurredAt: "2026-08-12 17:05",
        actorLabel: "提交人：张三 (实验小学)",
        tone: "primary",
      },
    ],
  },
  {
    id: "ach-004",
    code: "YX2026070012",
    title: "信息技术与学科融合教学论文",
    bureauName: "XX区教育局",
    semester: "2026-spring",
    type: "paper",
    levelLabel: "市级期刊",
    submittedAt: "2026-07-18",
    status: "approved",
    earnedCredits: 6,
    teacherName: "张三",
    schoolName: "实验小学",
    subject: "信息技术",
    stage: "小学",
    declaredScore: 6,
    abstract:
      "探讨信息技术与学科教学深度融合的课堂策略，总结案例并形成可发表论文成果。",
    attachments: [
      {
        id: "att-005",
        kind: "report",
        name: "信息技术融合教学论文.docx",
        sizeLabel: "980 KB",
        mimeHint: "word",
      },
    ],
    auditRecords: [
      {
        id: "audit-009",
        title: "区级终审 - 通过",
        occurredAt: "2026-07-22 16:00",
        actorLabel: "审核人：李教研员 (XX区教育局)",
        tone: "success",
      },
      {
        id: "audit-010",
        title: "提交成果",
        occurredAt: "2026-07-18 11:20",
        actorLabel: "提交人：张三 (实验小学)",
        tone: "primary",
      },
    ],
  },
  {
    id: "ach-005",
    code: "YX2026060008",
    title: "2026年校本研修项目参与",
    bureauName: "XX区教育局",
    semester: "2026-spring",
    type: "school-based",
    levelLabel: "校级",
    submittedAt: "2026-06-30",
    status: "approved",
    earnedCredits: 4,
    teacherName: "张三",
    schoolName: "实验小学",
    subject: "语文",
    stage: "小学",
    declaredScore: 4,
    abstract: "参与校本研修主题项目，完成专题学习、课堂实践与成果分享。",
    attachments: [
      {
        id: "att-006",
        kind: "certificate",
        name: "校本研修参与证明.pdf",
        sizeLabel: "640 KB",
        mimeHint: "pdf",
      },
    ],
    auditRecords: [
      {
        id: "audit-011",
        title: "学校认定 - 通过",
        occurredAt: "2026-07-02 09:00",
        actorLabel: "审核人：王校长 (实验小学)",
        tone: "success",
      },
      {
        id: "audit-012",
        title: "提交成果",
        occurredAt: "2026-06-30 18:10",
        actorLabel: "提交人：张三 (实验小学)",
        tone: "primary",
      },
    ],
  },
];

let details = seedDetails.map(cloneDetail);
let nextCodeSeq = 16;

export function resetTrainingAchievementMockData() {
  details = seedDetails.map(cloneDetail);
  nextCodeSeq = 16;
}

export function listTrainingAchievementMockRows() {
  return details.map(toRow);
}

export function getTrainingAchievementMockDetail(id: string) {
  const found = details.find((item) => item.id === id);
  return found ? cloneDetail(found) : undefined;
}

function bureauLabel(bureauId: string) {
  return (
    TRAINING_ACHIEVEMENT_BUREAU_OPTIONS.find((item) => item.id === bureauId)?.label ??
    "XX区教育局"
  );
}

function nextCode() {
  const code = `YX202609${String(nextCodeSeq).padStart(4, "0")}`;
  nextCodeSeq += 1;
  return code;
}

function todayLabel() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nowDateTimeLabel() {
  const now = new Date();
  const date = todayLabel();
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${date} ${h}:${min}`;
}

export function createTrainingAchievementMockDetail(
  input: TrainingAchievementFormInput,
): TrainingAchievementDetail {
  const type = input.type as TrainingAchievementType;
  const id = `ach-${Date.now()}`;
  const status = input.asDraft ? "draft" : "school-reviewing";
  const detail: TrainingAchievementDetail = {
    id,
    code: nextCode(),
    title: input.title.trim(),
    bureauName: bureauLabel(input.bureauId),
    semester: input.semester,
    type,
    levelLabel: resolveLevelLabel(type, input.levelId),
    submittedAt: todayLabel(),
    status,
    earnedCredits: null,
    teacherName: "张三",
    schoolName: "实验小学",
    subject: input.subject || "语文",
    stage: input.stage || "小学",
    declaredScore: resolveLevelScore(type, input.levelId),
    abstract: input.abstract.trim(),
    attachments: [...input.certificateFiles, ...input.reportFiles].map((item) => ({
      ...item,
    })),
    auditRecords: input.asDraft
      ? [
          {
            id: `audit-${id}-draft`,
            title: "保存草稿",
            occurredAt: nowDateTimeLabel(),
            actorLabel: "提交人：张三 (实验小学)",
            tone: "neutral",
          },
        ]
      : [
          {
            id: `audit-${id}-submit`,
            title: "提交成果",
            occurredAt: nowDateTimeLabel(),
            actorLabel: "提交人：张三 (实验小学)",
            tone: "primary",
          },
        ],
  };
  details = [detail, ...details];
  return cloneDetail(detail);
}

export function updateTrainingAchievementMockDetail(
  id: string,
  input: TrainingAchievementFormInput,
): TrainingAchievementDetail {
  const index = details.findIndex((item) => item.id === id);
  const current = index >= 0 ? details[index] : undefined;
  if (!current) throw new Error("成果不存在");
  const type = input.type as TrainingAchievementType;
  const status = input.asDraft ? "draft" : "school-reviewing";
  const updated: TrainingAchievementDetail = {
    id: current.id,
    code: current.code,
    title: input.title.trim(),
    bureauName: bureauLabel(input.bureauId),
    semester: input.semester,
    type,
    levelLabel: resolveLevelLabel(type, input.levelId),
    submittedAt: todayLabel(),
    status,
    earnedCredits: null,
    teacherName: current.teacherName,
    schoolName: current.schoolName,
    subject: input.subject || current.subject,
    stage: input.stage || current.stage,
    declaredScore: resolveLevelScore(type, input.levelId),
    abstract: input.abstract.trim(),
    attachments: [...input.certificateFiles, ...input.reportFiles].map((item) => ({
      ...item,
    })),
    auditRecords: [
      {
        id: `audit-${id}-${Date.now()}`,
        title: input.asDraft ? "保存草稿" : "修改重提",
        occurredAt: nowDateTimeLabel(),
        actorLabel: "提交人：张三 (实验小学)",
        tone: input.asDraft ? "neutral" : "primary",
      },
      ...current.auditRecords,
    ],
  };
  details = details.map((item, i) => (i === index ? updated : item));
  return cloneDetail(updated);
}

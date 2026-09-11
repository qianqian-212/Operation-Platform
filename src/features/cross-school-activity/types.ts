export type CrossSchoolActivityType = "lesson-prep" | "lesson-observation";
export type CrossSchoolActivityStatus = "ongoing" | "archived";
export type ActivityDiscussionStatus = "hot" | "summarized" | "discussing";
export type ActivityArchiveKind = "reflection" | "output";

export interface CrossSchoolActivityRow {
  id: string;
  name: string;
  type: CrossSchoolActivityType;
  scheduledAt: string;
  leadSchoolId: string;
  leadSchoolName: string;
  participantCount: number;
  schoolCount: number;
  status: CrossSchoolActivityStatus;
  allianceId: string;
  allianceName: string;
}

export interface ActivityParticipant {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
}

export interface ActivityLessonTopic {
  stage: string;
  subject: string;
  grade: string;
  title: string;
  period: string;
}

export interface ActivityTask {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  schoolName: string;
  resourceLabel: string;
}

export interface ActivityObservation {
  courseName: string;
  instructorName: string;
  scheduledAt: string;
  method: string;
  grade: string;
  subject: string;
  courseType: string;
  reviewerName: string;
  reviewMethod: string;
}

export interface ActivityDiscussion {
  id: string;
  title: string;
  initiatorName: string;
  initiatorSchool: string;
  replyCount: number;
  lastRepliedAt: string;
  status: ActivityDiscussionStatus;
}

export interface ActivityVoteOption {
  id: string;
  label: string;
  count: number;
}

export interface ActivityVote {
  id: string;
  title: string;
  options: ActivityVoteOption[];
}

export interface ActivityArchiveItem {
  id: string;
  title: string;
  kind: ActivityArchiveKind;
  createdAt: string;
  authorName: string;
}

export interface CrossSchoolActivityDetail extends CrossSchoolActivityRow {
  location: string;
  initiatorId: string;
  initiatorName: string;
  description: string;
  participants: ActivityParticipant[];
  topic: ActivityLessonTopic | null;
  tasks: ActivityTask[];
  observation: ActivityObservation | null;
  discussions: ActivityDiscussion[];
  votes: ActivityVote[];
  archives: ActivityArchiveItem[];
}

export interface CrossSchoolActivityFilter {
  name: string;
  type: CrossSchoolActivityType | "";
  status: CrossSchoolActivityStatus | "";
  allianceId: string;
}

export interface ActivityTaskInput {
  name: string;
  ownerId: string;
  resourceLabel: string;
}

export interface CrossSchoolActivityCreateInput {
  name: string;
  type: CrossSchoolActivityType;
  allianceId: string;
  scheduledAt: string;
  location: string;
  description: string;
  leadSchoolId: string;
  memberSchoolIds: string[];
  teacherIds: string[];
  topic: ActivityLessonTopic | null;
  tasks: ActivityTaskInput[];
  observation: ActivityObservation | null;
}

export interface ActivityAllianceOption {
  id: string;
  name: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export const ACTIVITY_TYPE_MAP: Record<
  CrossSchoolActivityType,
  { label: string; tagColor: "blue" | "orange" }
> = {
  "lesson-prep": { label: "集体备课", tagColor: "blue" },
  "lesson-observation": { label: "听评课", tagColor: "orange" },
};

export const ACTIVITY_STATUS_MAP: Record<
  CrossSchoolActivityStatus,
  { label: string; tagColor: "blue" | "green" }
> = {
  ongoing: { label: "进行中", tagColor: "blue" },
  archived: { label: "已归档", tagColor: "green" },
};

export const DISCUSSION_STATUS_MAP: Record<
  ActivityDiscussionStatus,
  { label: string; tagColor: "orange" | "green" | "blue" }
> = {
  hot: { label: "热议中", tagColor: "orange" },
  summarized: { label: "已总结", tagColor: "green" },
  discussing: { label: "讨论中", tagColor: "blue" },
};

export const ARCHIVE_KIND_MAP: Record<ActivityArchiveKind, string> = {
  reflection: "活动反思",
  output: "成果沉淀",
};

export const LESSON_STAGE_OPTIONS = ["小学", "初中", "高中", "九年一贯"] as const;
export const LESSON_SUBJECT_OPTIONS = ["语文", "数学", "英语", "科学", "物理"] as const;
export const LESSON_GRADE_OPTIONS = [
  "一年级",
  "二年级",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
  "七年级",
  "八年级",
  "九年级",
] as const;
export const OBSERVATION_METHOD_OPTIONS = ["线下听课", "线上同步", "录播回看"] as const;
export const COURSE_TYPE_OPTIONS = ["新授课", "复习课", "实验课", "练习课"] as const;
export const REVIEW_METHOD_OPTIONS = ["量表评课", "议课研讨", "书面反馈"] as const;

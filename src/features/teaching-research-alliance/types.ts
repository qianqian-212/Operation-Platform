export type AllianceStatus = "active" | "disabled";
export type SchoolStage = "primary" | "middle" | "nine-year";
export type AllianceMemberRole = "lead" | "member";
export type AllianceActivityStatus = "ongoing" | "archived";
export type AllianceSpaceTab = "documents" | "discussions" | "files";
export type AllianceDocumentStatus = "editing" | "finalized";
export type AllianceDiscussionStatus = "hot" | "summarized" | "discussing";

export interface TeachingResearchAllianceRow {
  id: string;
  name: string;
  leadSchoolId: string;
  leadSchoolName: string;
  memberSchoolCount: number;
  activityCount: number;
  teacherCount: number;
  adminId: string;
  adminName: string;
  status: AllianceStatus;
  spaceName: string;
  memberSchoolNames: string[];
  createdAt: string;
}

export interface AllianceMemberSchool {
  id: string;
  name: string;
  stage: SchoolStage;
  role: AllianceMemberRole;
  teacherCount: number;
  activityCount: number;
}

export interface AllianceSpaceSummary {
  title: string;
  documentCount: number;
  topicCount: number;
  fileCount: number;
}

export interface AllianceSpaceDocument {
  id: string;
  title: string;
  allianceName: string;
  lastEditedAt: string;
  status: AllianceDocumentStatus;
  editors: string[];
}

export interface AllianceSpaceDiscussion {
  id: string;
  title: string;
  allianceName: string;
  initiatorName: string;
  initiatorSchool: string;
  replyCount: number;
  lastRepliedAt: string;
  status: AllianceDiscussionStatus;
}

export interface AlliancePerformanceStats {
  participationRate: number;
  outputRate: number;
}

export interface AllianceActivity {
  id: string;
  name: string;
  typeLabel: string;
  scheduledAt: string;
  leadSchoolName: string;
  status: AllianceActivityStatus;
}

export interface TeachingResearchAllianceDetail extends TeachingResearchAllianceRow {
  description: string;
  memberSchools: AllianceMemberSchool[];
  space: AllianceSpaceSummary;
  documents: AllianceSpaceDocument[];
  discussions: AllianceSpaceDiscussion[];
  performance: AlliancePerformanceStats;
  activities: AllianceActivity[];
}

export interface TeachingResearchAllianceFilter {
  name: string;
  status: AllianceStatus | "";
}

export interface TeachingResearchAllianceStats {
  allianceCount: number;
  schoolCount: number;
  activityCount: number;
  teacherCount: number;
}

export function emptyAllianceStats(): TeachingResearchAllianceStats {
  return { allianceCount: 0, schoolCount: 0, activityCount: 0, teacherCount: 0 };
}

export interface TeachingResearchAllianceListResult {
  list: TeachingResearchAllianceRow[];
  total: number;
  stats: TeachingResearchAllianceStats;
}

export interface TeachingResearchAllianceCreateInput {
  name: string;
  leadSchoolId: string;
  adminId: string;
  memberSchoolIds: string[];
  teacherIds: string[];
  description: string;
}

export interface SchoolOption {
  id: string;
  name: string;
  stage: SchoolStage;
  district: string;
}

export interface TeacherOption {
  id: string;
  name: string;
  schoolId: string;
  subject: string;
  roleLabel: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export const ALLIANCE_STATUS_MAP: Record<
  AllianceStatus,
  { label: string; tagColor: "green" | "gray" }
> = {
  active: { label: "使用中", tagColor: "green" },
  disabled: { label: "已停用", tagColor: "gray" },
};

export const SCHOOL_STAGE_LABEL: Record<SchoolStage, string> = {
  primary: "小学",
  middle: "中学",
  "nine-year": "九年一贯",
};

export const MEMBER_ROLE_MAP: Record<
  AllianceMemberRole,
  { label: string; tagColor: "orange" | "gray" }
> = {
  lead: { label: "牵头学校", tagColor: "orange" },
  member: { label: "成员学校", tagColor: "gray" },
};

export const ACTIVITY_STATUS_MAP: Record<
  AllianceActivityStatus,
  { label: string; tagColor: "blue" | "green" }
> = {
  ongoing: { label: "进行中", tagColor: "blue" },
  archived: { label: "已归档", tagColor: "green" },
};

export const DOCUMENT_STATUS_MAP: Record<
  AllianceDocumentStatus,
  { label: string; tagColor: "blue" | "green" }
> = {
  editing: { label: "编辑中", tagColor: "blue" },
  finalized: { label: "已定稿", tagColor: "green" },
};

export const DISCUSSION_STATUS_MAP: Record<
  AllianceDiscussionStatus,
  { label: string; tagColor: "orange" | "green" | "blue" }
> = {
  hot: { label: "热议中", tagColor: "orange" },
  summarized: { label: "已总结", tagColor: "blue" },
  discussing: { label: "讨论中", tagColor: "green" },
};

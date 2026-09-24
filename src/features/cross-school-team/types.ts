import type { StatusTagColor } from "@/components/StatusTag.vue";

export type CrossSchoolTeamStatus = "active" | "disabled";
export type CrossSchoolTeamMemberRole = "lead" | "member";
export type CrossSchoolTeamActivityStatus = "ongoing" | "archived";

export interface CrossSchoolTeamRow {
  id: string;
  name: string;
  allianceId: string;
  allianceName: string;
  subject: string;
  leadTeacherName: string;
  leadSchoolName: string;
  memberCount: number;
  status: CrossSchoolTeamStatus;
}

export interface CrossSchoolTeamMember {
  id: string;
  name: string;
  schoolName: string;
  subject: string;
  title: string;
  role: CrossSchoolTeamMemberRole;
}

export interface CrossSchoolTeamActivity {
  id: string;
  name: string;
  typeLabel: string;
  scheduledAt: string;
  leadSchoolName: string;
  status: CrossSchoolTeamActivityStatus;
}

export interface CrossSchoolTeamAchievement {
  id: string;
  title: string;
  publishedAt: string;
  shareCount: number;
}

export interface CrossSchoolTeamDetail extends CrossSchoolTeamRow {
  description: string;
  members: CrossSchoolTeamMember[];
  activities: CrossSchoolTeamActivity[];
  achievements: CrossSchoolTeamAchievement[];
}

export interface CrossSchoolTeamFilter {
  allianceId: string;
  subject: string;
  name: string;
}

export interface CrossSchoolTeamStats {
  activityCount: number;
  teamCount: number;
  teacherCount: number;
  achievementCount: number;
}

export interface CrossSchoolTeamListResult {
  list: CrossSchoolTeamRow[];
  total: number;
  stats: CrossSchoolTeamStats;
}

export interface AllianceOption {
  id: string;
  name: string;
}

export function emptyTeamStats(): CrossSchoolTeamStats {
  return { activityCount: 0, teamCount: 0, teacherCount: 0, achievementCount: 0 };
}

export const TEAM_STATUS_MAP: Record<
  CrossSchoolTeamStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  active: { label: "使用中", tagColor: "green" },
  disabled: { label: "已停用", tagColor: "gray" },
};

export const TEAM_MEMBER_ROLE_MAP: Record<
  CrossSchoolTeamMemberRole,
  { label: string; tagColor: StatusTagColor }
> = {
  lead: { label: "负责人", tagColor: "blue" },
  member: { label: "成员", tagColor: "gray" },
};

export const TEAM_ACTIVITY_STATUS_MAP: Record<
  CrossSchoolTeamActivityStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  ongoing: { label: "进行中", tagColor: "green" },
  archived: { label: "已归档", tagColor: "gray" },
};

export const TEAM_SUBJECT_OPTIONS = ["语文", "数学", "英语", "科学"] as const;

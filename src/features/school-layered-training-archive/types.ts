export interface SchoolTrainingArchiveQuery {
  bureau: string;
  semester: string;
}

export interface SchoolTrainingArchiveProfile {
  name: string;
  schoolName: string;
  subject: string;
  jobTitle: string;
  developmentStage: string;
  completedCount: number;
  completedTarget: number;
  hours: number;
  hoursTarget: number;
  credits: number;
  creditsTarget: number;
  averageRating: number;
  ratedCount: number;
}

export interface SchoolTrainingArchiveCourse {
  id: string;
  title: string;
  credit: number;
  completedAt: string;
  stars: number;
}

export interface SchoolTrainingArchiveProgress {
  id: string;
  courseId: string;
  title: string;
  lastStudy: string;
  progress: number;
  barColor: string;
}

export interface SchoolTrainingArchiveCredit {
  id: string;
  title: string;
  kind: string;
  credit: number;
  recognizedAt: string;
  status: string;
}

export interface SchoolTrainingArchiveSnapshot {
  profile: SchoolTrainingArchiveProfile;
  completed: SchoolTrainingArchiveCourse[];
  progress: SchoolTrainingArchiveProgress[];
  credits: SchoolTrainingArchiveCredit[];
}

export interface SchoolTrainingArchiveStat {
  label: string;
  value: string;
  hint: string;
  accent: boolean;
}

export const ARCHIVE_PAGE_SIZE = 10;
export const ARCHIVE_BUREAU_OPTIONS = ["XX区教育局", "体验区教育局"];
export const ARCHIVE_SEMESTER_OPTIONS = ["2026年秋季学期", "2026年春季学期"];

export function archiveAvatarText(name: string) {
  return name.slice(-2);
}

export function archiveProfileStats(profile: SchoolTrainingArchiveProfile): SchoolTrainingArchiveStat[] {
  return [
    stat("完成课程数", profile.completedCount, `年度目标：${profile.completedTarget}门`, false),
    stat("累计学时", profile.hours, `年度目标：${profile.hoursTarget}学时`, false),
    stat("已获学分", profile.credits, `年度目标：${profile.creditsTarget}学分`, false),
    stat("平均评分", profile.averageRating, `已评价${profile.ratedCount}门课程`, true),
  ];
}

function stat(label: string, value: number, hint: string, accent: boolean): SchoolTrainingArchiveStat {
  return { label, value: String(value), hint, accent };
}

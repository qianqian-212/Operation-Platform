import type {
  SchoolTrainingArchiveCourse,
  SchoolTrainingArchiveCredit,
  SchoolTrainingArchiveProgress,
  SchoolTrainingArchiveQuery,
  SchoolTrainingArchiveSnapshot,
} from "@/features/school-layered-training-archive/types";

const COURSE_TITLE = "作文教学创新与实践";
const COMPLETED_TOTAL = 100;
const CREDIT_TOTAL = 5;
const STUDYING_TOTAL = 3;

const SNAPSHOT: SchoolTrainingArchiveSnapshot = {
  profile: {
    name: "张晓晓",
    schoolName: "实验小学",
    subject: "语文",
    jobTitle: "一级教师",
    developmentStage: "骨干型教师",
    completedCount: 12,
    completedTarget: 20,
    hours: 34,
    hoursTarget: 72,
    credits: 5,
    creditsTarget: 36,
    averageRating: 4.6,
    ratedCount: 8,
  },
  completed: completedCourses(),
  progress: studyingCourses(),
  credits: creditRecords(),
};

function completedCourses(): SchoolTrainingArchiveCourse[] {
  return Array.from({ length: COMPLETED_TOTAL }, (_, index) => ({
    id: `sta-${String(index + 1).padStart(3, "0")}`,
    title: COURSE_TITLE,
    credit: 2,
    completedAt: "2026-09-12",
    stars: index === 2 ? 4 : 5,
  }));
}

function studyingCourses(): SchoolTrainingArchiveProgress[] {
  return Array.from({ length: STUDYING_TOTAL }, (_, index) => ({
    id: `stp-00${index + 1}`,
    courseId: "sfc-003",
    title: COURSE_TITLE,
    lastStudy: "09-09 · 2天前",
    progress: 80,
    barColor: "var(--color-success-dark-text)",
  }));
}

function creditRecords(): SchoolTrainingArchiveCredit[] {
  return Array.from({ length: CREDIT_TOTAL }, (_, index) => ({
    id: `stc-00${index + 1}`,
    title: COURSE_TITLE,
    kind: "在线课程",
    credit: 2,
    recognizedAt: "2026-09-12",
    status: "已认定",
  }));
}

function cloneSnapshot(): SchoolTrainingArchiveSnapshot {
  return {
    profile: { ...SNAPSHOT.profile },
    completed: SNAPSHOT.completed.map((item) => ({ ...item })),
    progress: SNAPSHOT.progress.map((item) => ({ ...item })),
    credits: SNAPSHOT.credits.map((item) => ({ ...item })),
  };
}

export function getSchoolTrainingArchive(_query: SchoolTrainingArchiveQuery) {
  return cloneSnapshot();
}

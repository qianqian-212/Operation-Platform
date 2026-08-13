import type { EducationStage, EnrollmentStatus } from "@/features/student-growth-portrait/data-contract";

export type ArchiveTreeNodeKind = "region" | "school";

export interface ArchiveSchool {
  id: string;
  name: string;
  educationStage: EducationStage;
}

export interface ArchiveStudentRow {
  studentId: string;
  studentNo: string;
  name: string;
  schoolId: string;
  schoolName: string;
  educationStage: EducationStage;
  grade: string;
  classId: string;
  className: string;
  enrollmentStatus: EnrollmentStatus;
}

export interface ArchiveStudentListQuery {
  schoolId: string;
  educationStage?: EducationStage | "all";
  grade?: string;
  classId?: string;
  keyword?: string;
  enrollmentStatus?: EnrollmentStatus | "all";
}

export interface ArchiveTreeNode {
  id: string;
  label: string;
  kind: ArchiveTreeNodeKind;
  schoolId?: string;
  disabled?: boolean;
  children?: ArchiveTreeNode[];
}

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  active: "在籍",
  transferred: "转出",
  graduated: "毕业",
  suspended: "休学",
};

export const educationStageLabels: Record<EducationStage, string> = {
  primary: "小学",
  junior: "初中",
  senior: "高中",
};

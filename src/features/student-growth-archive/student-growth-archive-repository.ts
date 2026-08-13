import type { EducationStage } from "@/features/student-growth-portrait/data-contract";
import type { TenantAdministrativeRegion } from "@/types/user";
import {
  buildArchiveSchoolTree,
  collectDefaultExpandedKeys,
} from "./school-tree";
import type {
  ArchiveSchool,
  ArchiveStudentListQuery,
  ArchiveStudentRow,
  ArchiveTreeNode,
} from "./types";
import {
  findArchiveStudent,
  listArchiveSchools,
  listArchiveStudents,
} from "./virtual-archive-roster";

export interface StudentGrowthArchiveRepository {
  listSchools(): Promise<ArchiveSchool[]>;
  getSchoolTree(
    region: TenantAdministrativeRegion | undefined,
    schoolKeyword?: string,
  ): Promise<{ tree: ArchiveTreeNode[]; expandedKeys: string[] }>;
  listStudents(query: ArchiveStudentListQuery): Promise<ArchiveStudentRow[]>;
  listClassOptions(schoolId: string): Promise<Array<{ classId: string; className: string }>>;
  listGradeOptions(schoolId: string, educationStage?: EducationStage | "all"): Promise<string[]>;
  getStudent(studentId: string): Promise<ArchiveStudentRow | null>;
}

function matchesEducationStage(
  student: ArchiveStudentRow,
  educationStage: EducationStage | "all" | undefined,
) {
  return !educationStage || educationStage === "all" || student.educationStage === educationStage;
}

export class VirtualStudentGrowthArchiveRepository implements StudentGrowthArchiveRepository {
  async listSchools() {
    return listArchiveSchools();
  }

  async getSchoolTree(region: TenantAdministrativeRegion | undefined, schoolKeyword = "") {
    const schools = listArchiveSchools();
    const tree = buildArchiveSchoolTree(region, schools, schoolKeyword);
    return {
      tree,
      expandedKeys: collectDefaultExpandedKeys(tree),
    };
  }

  async listStudents(query: ArchiveStudentListQuery) {
    const keyword = query.keyword?.trim().toLowerCase() ?? "";
    return listArchiveStudents().filter((student) => {
      if (student.schoolId !== query.schoolId) return false;
      if (!matchesEducationStage(student, query.educationStage)) return false;
      if (query.grade && query.grade !== "全部年级" && student.grade !== query.grade) return false;
      if (query.classId && student.classId !== query.classId) return false;
      if (
        query.enrollmentStatus
        && query.enrollmentStatus !== "all"
        && student.enrollmentStatus !== query.enrollmentStatus
      ) {
        return false;
      }
      if (!keyword) return true;
      return student.name.toLowerCase().includes(keyword)
        || student.studentNo.toLowerCase().includes(keyword)
        || student.studentId.toLowerCase().includes(keyword);
    });
  }

  async listClassOptions(schoolId: string) {
    const classes = new Map<string, string>();
    listArchiveStudents()
      .filter((student) => student.schoolId === schoolId)
      .forEach((student) => {
        classes.set(student.classId, student.className);
      });
    return [...classes.entries()]
      .map(([classId, className]) => ({ classId, className }))
      .sort((left, right) => left.className.localeCompare(right.className, "zh-CN"));
  }

  async listGradeOptions(schoolId: string, educationStage: EducationStage | "all" = "all") {
    const gradeOrder = [
      "一年级", "二年级", "三年级", "四年级", "五年级", "六年级",
      "七年级", "八年级", "九年级", "高一", "高二", "高三",
    ] as const;
    const grades = new Set<string>();
    listArchiveStudents()
      .filter((student) => (
        student.schoolId === schoolId && matchesEducationStage(student, educationStage)
      ))
      .forEach((student) => grades.add(student.grade));
    return [...grades].sort((left, right) => {
      const leftIndex = gradeOrder.indexOf(left as (typeof gradeOrder)[number]);
      const rightIndex = gradeOrder.indexOf(right as (typeof gradeOrder)[number]);
      if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right, "zh-CN");
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    });
  }

  async getStudent(studentId: string) {
    return findArchiveStudent(studentId);
  }
}

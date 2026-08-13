import type { EducationStage, EnrollmentStatus } from "@/features/student-growth-portrait/data-contract";
import type { ArchiveSchool, ArchiveStudentRow } from "./types";

/**
 * 学生成长档案首期虚拟花名册。
 * 学校与学籍结构对齐画像演示数据，但补充列表所需的姓名与学号展示字段。
 */
const schoolDefinitions = [
  { id: "virtual-primary-a", name: "虚拟示范小学 A", educationStage: "primary" as const },
  { id: "virtual-primary-b", name: "虚拟示范小学 B", educationStage: "primary" as const },
  { id: "virtual-junior-a", name: "虚拟示范初中 A", educationStage: "junior" as const },
  { id: "virtual-junior-b", name: "虚拟示范初中 B", educationStage: "junior" as const },
  { id: "virtual-senior-a", name: "虚拟示范高中 A", educationStage: "senior" as const },
  { id: "virtual-senior-b", name: "虚拟示范高中 B", educationStage: "senior" as const },
] as const;

const givenNames = [
  "明轩", "浩然", "子墨", "雨桐", "一诺", "思远",
  "梓涵", "欣怡", "嘉怡", "宇航", "诗涵", "博文",
] as const;

const surnames = ["陈", "林", "黄", "张", "李", "王", "吴", "刘", "蔡", "杨", "许", "郑"] as const;

function gradeForStudent(educationStage: EducationStage, studentIndex: number) {
  if (educationStage === "primary") return studentIndex < 6 ? "四年级" : "五年级";
  if (educationStage === "junior") return studentIndex < 6 ? "七年级" : "八年级";
  return studentIndex < 6 ? "高一" : "高二";
}

function enrollmentStatusFor(studentIndex: number): EnrollmentStatus {
  if (studentIndex === 10) return "transferred";
  if (studentIndex === 11) return "suspended";
  return "active";
}

function classLabel(classId: string) {
  return classId.endsWith("-01") ? "1 班" : "2 班";
}

function buildStudents(): ArchiveStudentRow[] {
  const rows: ArchiveStudentRow[] = [];
  schoolDefinitions.forEach((school, schoolIndex) => {
    for (let studentIndex = 0; studentIndex < 12; studentIndex += 1) {
      const ordinal = studentIndex + 1;
      const studentId = `${school.id}-student-${String(ordinal).padStart(2, "0")}`;
      const classSuffix = studentIndex < 6 ? "01" : "02";
      const classId = `${school.id}-class-${classSuffix}`;
      rows.push({
        studentId,
        studentNo: `${school.educationStage === "primary" ? "P" : school.educationStage === "junior" ? "J" : "S"}${String(schoolIndex + 1).padStart(2, "0")}${String(ordinal).padStart(3, "0")}`,
        name: `${surnames[(schoolIndex + studentIndex) % surnames.length]}${givenNames[studentIndex]!}`,
        schoolId: school.id,
        schoolName: school.name,
        educationStage: school.educationStage,
        grade: gradeForStudent(school.educationStage, studentIndex),
        classId,
        className: classLabel(classId),
        enrollmentStatus: enrollmentStatusFor(studentIndex),
      });
    }
  });
  return rows;
}

const schools: readonly ArchiveSchool[] = schoolDefinitions.map((school) => ({ ...school }));
const students: readonly ArchiveStudentRow[] = buildStudents();

export function listArchiveSchools(): ArchiveSchool[] {
  return schools.map((school) => ({ ...school }));
}

export function listArchiveStudents(): ArchiveStudentRow[] {
  return students.map((student) => ({ ...student }));
}

export function findArchiveStudent(studentId: string) {
  const student = students.find((item) => item.studentId === studentId);
  return student ? { ...student } : null;
}

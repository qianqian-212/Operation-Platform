import {
  VirtualStudentGrowthArchiveRepository,
  type StudentGrowthArchiveRepository,
} from "./student-growth-archive-repository";

export const runtimeStudentGrowthArchiveRepository: StudentGrowthArchiveRepository =
  new VirtualStudentGrowthArchiveRepository();

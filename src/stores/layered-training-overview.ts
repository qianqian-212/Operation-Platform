import { ref } from "vue";
import { defineStore } from "pinia";
import { layeredTrainingOverviewRepository } from "@/features/layered-training-overview/layered-training-overview-repository";
import {
  LAYERED_TRAINING_OVERVIEW_SEMESTER_OPTIONS,
  type LayeredTrainingOverviewQuery,
  type LayeredTrainingOverviewSchool,
  type LayeredTrainingOverviewSummary,
  type LayeredTrainingOverviewTeacher,
  type LayeredTrainingSchoolSort,
} from "@/features/layered-training-overview/types";
import { useUserStore } from "@/stores/user";

export const useLayeredTrainingOverviewStore = defineStore("layered-training-overview", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const semester = ref<string>(LAYERED_TRAINING_OVERVIEW_SEMESTER_OPTIONS[0].value);
  const schoolKeyword = ref("");
  const teacherSchool = ref("");
  const teacherSubject = ref("");
  const schoolSort = ref<LayeredTrainingSchoolSort>("reach");
  const currentPage = ref(1);
  const pageSize = ref(10);
  const summary = ref<LayeredTrainingOverviewSummary | null>(null);
  const schools = ref<LayeredTrainingOverviewSchool[]>([]);
  const schoolOptions = ref<string[]>([]);
  const subjectOptions = ref<string[]>([]);
  const teachers = ref<LayeredTrainingOverviewTeacher[]>([]);
  const teacherTotal = ref(0);
  let requestSequence = 0;

  function buildQuery(): LayeredTrainingOverviewQuery {
    return {
      semester: semester.value,
      schoolKeyword: schoolKeyword.value,
      teacherSchool: teacherSchool.value,
      teacherSubject: teacherSubject.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      schoolSort: schoolSort.value,
    };
  }

  async function load() {
    const sequence = ++requestSequence;
    loading.value = true;
    try {
      const result = await layeredTrainingOverviewRepository.load(
        userStore.currentTenant.id,
        buildQuery(),
      );
      if (sequence !== requestSequence) return;
      summary.value = result.summary;
      schools.value = result.schools;
      schoolOptions.value = result.schoolOptions;
      subjectOptions.value = result.subjectOptions;
      teachers.value = result.teachers;
      teacherTotal.value = result.teacherTotal;
    } finally {
      if (sequence === requestSequence) loading.value = false;
    }
  }

  function setSchoolKeyword(value: string) {
    schoolKeyword.value = value;
    return load();
  }

  function changeSemester(value: string) {
    semester.value = value;
    schoolKeyword.value = "";
    teacherSchool.value = "";
    teacherSubject.value = "";
    currentPage.value = 1;
    return load();
  }

  function setSchoolSort(sort: LayeredTrainingSchoolSort) {
    schoolSort.value = sort;
    return load();
  }

  function searchTeachers(school: string, subject: string) {
    teacherSchool.value = school;
    teacherSubject.value = subject;
    currentPage.value = 1;
    return load();
  }

  function setPage(page: number) {
    currentPage.value = page;
    return load();
  }

  function setPageSize(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
    return load();
  }

  return {
    loading,
    semester,
    schoolKeyword,
    teacherSchool,
    teacherSubject,
    currentPage,
    pageSize,
    schoolSort,
    summary,
    schools,
    schoolOptions,
    subjectOptions,
    teachers,
    teacherTotal,
    load,
    setSchoolKeyword,
    changeSemester,
    searchTeachers,
    setSchoolSort,
    setPage,
    setPageSize,
  };
});

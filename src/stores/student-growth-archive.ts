import { computed, reactive, ref } from "vue";
import { defineStore } from "pinia";
import type { EducationStage, EnrollmentStatus } from "@/features/student-growth-portrait/data-contract";
import { runtimeStudentGrowthArchiveRepository } from "@/features/student-growth-archive/runtime-student-growth-archive-repository";
import {
  findFirstSchoolNode,
  findSchoolNodeById,
} from "@/features/student-growth-archive/school-tree";
import type {
  ArchiveStudentRow,
  ArchiveTreeNode,
} from "@/features/student-growth-archive/types";
import { useUserStore } from "@/stores/user";

export type ArchiveStageFilter = EducationStage | "all";
export type ArchiveStatusFilter = EnrollmentStatus | "all";

export interface ArchiveListFilterDraft {
  stage: ArchiveStageFilter;
  grade: string;
  classId: string;
  keyword: string;
  enrollmentStatus: ArchiveStatusFilter;
}

export function defaultArchiveListFilter(): ArchiveListFilterDraft {
  return {
    stage: "all",
    grade: "全部年级",
    classId: "",
    keyword: "",
    enrollmentStatus: "active",
  };
}

/**
 * 学生成长档案列表的会话级临时状态。
 * 与机构审核列表相同：挂在 Pinia，详情往返可恢复；刷新页面后丢失。
 */
export const useStudentGrowthArchiveStore = defineStore("student-growth-archive", () => {
  const userStore = useUserStore();

  const filterDraft = reactive<ArchiveListFilterDraft>(defaultArchiveListFilter());
  const appliedFilter = reactive<ArchiveListFilterDraft>(defaultArchiveListFilter());
  const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    total: 0,
  });

  const treeSearch = ref("");
  const treeData = ref<ArchiveTreeNode[]>([]);
  const expandedKeys = ref<string[]>([]);
  const selectedSchoolId = ref<string | null>(null);
  const selectedSchoolName = ref("");
  const currentTreeNodeKey = ref<string | undefined>(undefined);

  const classOptions = ref<Array<{ classId: string; className: string }>>([]);
  const gradeOptions = ref<string[]>([]);
  const allRows = ref<ArchiveStudentRow[]>([]);
  const loading = ref(false);
  const treeLoading = ref(false);
  const initializedTenantId = ref<string | null>(null);

  const tableData = computed(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    return allRows.value.slice(start, start + pagination.pageSize);
  });

  const toolbarTitle = computed(() => (
    selectedSchoolId.value
      ? `${selectedSchoolName.value} · 学生列表`
      : "学生列表"
  ));

  function resetSchoolScopedFilters() {
    filterDraft.grade = "全部年级";
    filterDraft.classId = "";
    appliedFilter.grade = "全部年级";
    appliedFilter.classId = "";
  }

  async function refreshClassAndGradeOptions() {
    if (!selectedSchoolId.value) {
      classOptions.value = [];
      gradeOptions.value = [];
      return;
    }
    const [classes, grades] = await Promise.all([
      runtimeStudentGrowthArchiveRepository.listClassOptions(selectedSchoolId.value),
      runtimeStudentGrowthArchiveRepository.listGradeOptions(
        selectedSchoolId.value,
        filterDraft.stage,
      ),
    ]);
    classOptions.value = classes;
    gradeOptions.value = grades;
    if (filterDraft.classId && !classes.some((item) => item.classId === filterDraft.classId)) {
      filterDraft.classId = "";
      appliedFilter.classId = "";
    }
    if (filterDraft.grade !== "全部年级" && !grades.includes(filterDraft.grade)) {
      filterDraft.grade = "全部年级";
      appliedFilter.grade = "全部年级";
    }
  }

  async function loadStudents() {
    if (!selectedSchoolId.value) {
      allRows.value = [];
      pagination.total = 0;
      return;
    }
    loading.value = true;
    try {
      const rows = await runtimeStudentGrowthArchiveRepository.listStudents({
        schoolId: selectedSchoolId.value,
        educationStage: appliedFilter.stage,
        grade: appliedFilter.grade,
        classId: appliedFilter.classId || undefined,
        keyword: appliedFilter.keyword,
        enrollmentStatus: appliedFilter.enrollmentStatus,
      });
      allRows.value = rows;
      pagination.total = rows.length;
      const maxPage = Math.max(1, Math.ceil(rows.length / pagination.pageSize) || 1);
      if (pagination.currentPage > maxPage) {
        pagination.currentPage = maxPage;
      }
    } finally {
      loading.value = false;
    }
  }

  async function applyFilters() {
    appliedFilter.stage = filterDraft.stage;
    appliedFilter.grade = filterDraft.grade;
    appliedFilter.classId = filterDraft.classId;
    appliedFilter.keyword = filterDraft.keyword.trim();
    appliedFilter.enrollmentStatus = filterDraft.enrollmentStatus;
    filterDraft.keyword = appliedFilter.keyword;
    pagination.currentPage = 1;
    await loadStudents();
  }

  async function resetFilters() {
    Object.assign(filterDraft, defaultArchiveListFilter());
    await refreshClassAndGradeOptions();
    await applyFilters();
  }

  async function selectSchool(schoolId: string, schoolName: string, options?: {
    resetScopedFilters?: boolean;
    resetPage?: boolean;
  }) {
    const schoolChanged = selectedSchoolId.value !== schoolId;
    selectedSchoolId.value = schoolId;
    selectedSchoolName.value = schoolName;
    currentTreeNodeKey.value = `school:${schoolId}`;
    if (schoolChanged && options?.resetScopedFilters !== false) {
      resetSchoolScopedFilters();
    }
    if (options?.resetPage !== false) {
      pagination.currentPage = 1;
    }
    await refreshClassAndGradeOptions();
    appliedFilter.stage = filterDraft.stage;
    appliedFilter.grade = filterDraft.grade;
    appliedFilter.classId = filterDraft.classId;
    appliedFilter.keyword = filterDraft.keyword.trim();
    appliedFilter.enrollmentStatus = filterDraft.enrollmentStatus;
    await loadStudents();
  }

  async function handleTreeNodeClick(data: ArchiveTreeNode) {
    if (data.kind !== "school" || !data.schoolId) return;
    if (data.schoolId === selectedSchoolId.value) return;
    await selectSchool(data.schoolId, data.label, {
      resetScopedFilters: true,
      resetPage: true,
    });
  }

  async function loadTree(options?: { ensureSchoolSelection?: boolean }) {
    treeLoading.value = true;
    try {
      const result = await runtimeStudentGrowthArchiveRepository.getSchoolTree(
        userStore.currentTenant.administrativeRegion,
        treeSearch.value,
      );
      treeData.value = result.tree;
      expandedKeys.value = result.expandedKeys;

      if (!options?.ensureSchoolSelection) return;

      if (selectedSchoolId.value) {
        const existing = findSchoolNodeById(result.tree, selectedSchoolId.value);
        if (existing?.schoolId) {
          selectedSchoolName.value = existing.label;
          currentTreeNodeKey.value = existing.id;
          await refreshClassAndGradeOptions();
          await loadStudents();
          return;
        }
      }

      const firstSchool = findFirstSchoolNode(result.tree);
      if (firstSchool?.schoolId) {
        await selectSchool(firstSchool.schoolId, firstSchool.label, {
          resetScopedFilters: false,
          resetPage: selectedSchoolId.value !== firstSchool.schoolId,
        });
      } else {
        selectedSchoolId.value = null;
        selectedSchoolName.value = "";
        currentTreeNodeKey.value = undefined;
        allRows.value = [];
        pagination.total = 0;
      }
    } finally {
      treeLoading.value = false;
    }
  }

  async function ensureInitialized() {
    const tenantId = userStore.currentTenant.id;
    if (initializedTenantId.value === tenantId && treeData.value.length > 0) {
      await loadTree({ ensureSchoolSelection: true });
      return;
    }
    if (initializedTenantId.value !== tenantId) {
      Object.assign(filterDraft, defaultArchiveListFilter());
      Object.assign(appliedFilter, defaultArchiveListFilter());
      pagination.currentPage = 1;
      pagination.pageSize = 20;
      pagination.total = 0;
      selectedSchoolId.value = null;
      selectedSchoolName.value = "";
      currentTreeNodeKey.value = undefined;
      treeSearch.value = "";
      allRows.value = [];
    }
    initializedTenantId.value = tenantId;
    await loadTree({ ensureSchoolSelection: true });
  }

  async function onStageDraftChange() {
    filterDraft.grade = "全部年级";
    await refreshClassAndGradeOptions();
  }

  function setPageSize(size: number) {
    pagination.pageSize = size;
    pagination.currentPage = 1;
  }

  function setPage(page: number) {
    pagination.currentPage = page;
  }

  return {
    filterDraft,
    appliedFilter,
    pagination,
    treeSearch,
    treeData,
    expandedKeys,
    selectedSchoolId,
    selectedSchoolName,
    currentTreeNodeKey,
    classOptions,
    gradeOptions,
    allRows,
    tableData,
    toolbarTitle,
    loading,
    treeLoading,
    ensureInitialized,
    loadTree,
    applyFilters,
    resetFilters,
    handleTreeNodeClick,
    onStageDraftChange,
    setPageSize,
    setPage,
  };
});

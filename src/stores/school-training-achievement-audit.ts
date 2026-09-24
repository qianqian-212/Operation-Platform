import { ref } from "vue";
import { defineStore } from "pinia";
import { schoolTrainingAchievementAuditRepository } from "@/features/school-training-achievement-audit/school-training-achievement-audit-repository";
import type {
  SchoolAchievementAuditDetail,
  SchoolAchievementAuditListQuery,
  SchoolAchievementAuditRow,
  SchoolAchievementAuditStats,
  SchoolAchievementAuditType,
} from "@/features/school-training-achievement-audit/types";
import { useUserStore } from "@/stores/user";

function emptyStats(): SchoolAchievementAuditStats {
  return {
    pendingCount: 0,
    districtReviewingCount: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
  };
}

export const useSchoolTrainingAchievementAuditStore = defineStore(
  "school-training-achievement-audit",
  () => {
    const userStore = useUserStore();
    const loading = ref(false);
    const schoolName = ref("");
    const stats = ref(emptyStats());
    const rows = ref<SchoolAchievementAuditRow[]>([]);
    const total = ref(0);
    const tabCounts = ref({
      pending: 0,
      "district-reviewing": 0,
      approved: 0,
      rejected: 0,
      all: 0,
    });
    const detail = ref<SchoolAchievementAuditDetail | null>(null);
    const filterForm = ref({
      statusTab: "pending" as SchoolAchievementAuditListQuery["statusTab"],
      semester: "",
      type: "" as SchoolAchievementAuditType | "",
      keyword: "",
    });
    const currentPage = ref(1);
    const pageSize = ref(10);

    function buildQuery(): SchoolAchievementAuditListQuery {
      return {
        ...filterForm.value,
        page: currentPage.value,
        pageSize: pageSize.value,
      };
    }

    async function loadList() {
      loading.value = true;
      try {
        const result = await schoolTrainingAchievementAuditRepository.list(
          userStore.currentTenant.id,
          buildQuery(),
        );
        schoolName.value = result.schoolName;
        stats.value = result.stats;
        rows.value = result.rows;
        total.value = result.total;
        tabCounts.value = result.tabCounts;
      } finally {
        loading.value = false;
      }
    }

    function search() {
      currentPage.value = 1;
      return loadList();
    }

    function resetFilter() {
      filterForm.value = { statusTab: "pending", semester: "", type: "", keyword: "" };
      currentPage.value = 1;
      return loadList();
    }

    function setStatusTab(tab: SchoolAchievementAuditListQuery["statusTab"]) {
      filterForm.value.statusTab = tab;
      currentPage.value = 1;
      return loadList();
    }

    function setPage(page: number) {
      currentPage.value = page;
      return loadList();
    }

    function setPageSize(size: number) {
      pageSize.value = size;
      currentPage.value = 1;
      return loadList();
    }

    async function loadDetail(id: string) {
      detail.value = await schoolTrainingAchievementAuditRepository.detail(
        userStore.currentTenant.id,
        id,
      );
    }

    async function approve(id: string, remark: string) {
      detail.value = await schoolTrainingAchievementAuditRepository.approve(
        userStore.currentTenant.id,
        id,
        remark,
      );
      await loadList();
    }

    async function reject(id: string, remark: string) {
      detail.value = await schoolTrainingAchievementAuditRepository.reject(
        userStore.currentTenant.id,
        id,
        remark,
      );
      await loadList();
    }

    return {
      loading,
      schoolName,
      stats,
      rows,
      total,
      tabCounts,
      detail,
      filterForm,
      currentPage,
      pageSize,
      loadList,
      search,
      resetFilter,
      setStatusTab,
      setPage,
      setPageSize,
      loadDetail,
      approve,
      reject,
    };
  },
);

import { ref } from "vue";
import { defineStore } from "pinia";
import { schoolExcellentAchievementsRepository } from "@/features/school-excellent-achievements/school-excellent-achievements-repository";
import type {
  ExcellentAchievementCard,
  ExcellentAchievementDetail,
  ExcellentAchievementListQuery,
  ExcellentAchievementSortKey,
} from "@/features/school-excellent-achievements/types";
import type { TrainingAchievementType } from "@/features/training-achievement/types";
import { useUserStore } from "@/stores/user";

export const useSchoolExcellentAchievementsStore = defineStore(
  "school-excellent-achievements",
  () => {
    const userStore = useUserStore();
    const loading = ref(false);
    const detailLoading = ref(false);
    const rows = ref<ExcellentAchievementCard[]>([]);
    const total = ref(0);
    const detail = ref<ExcellentAchievementDetail | null>(null);
    const type = ref<TrainingAchievementType | "">("");
    const stage = ref("");
    const subject = ref("");
    const sortKey = ref<ExcellentAchievementSortKey>("latest");
    const currentPage = ref(1);
    const pageSize = ref(6);

    function buildQuery(): ExcellentAchievementListQuery {
      return {
        type: type.value,
        stage: stage.value,
        subject: subject.value,
        sortKey: sortKey.value,
        page: currentPage.value,
        pageSize: pageSize.value,
      };
    }

    async function loadList() {
      loading.value = true;
      try {
        const result = await schoolExcellentAchievementsRepository.list(
          userStore.currentTenant.id,
          buildQuery(),
        );
        rows.value = result.rows;
        total.value = result.total;
      } finally {
        loading.value = false;
      }
    }

    function search() {
      currentPage.value = 1;
      return loadList();
    }

    function resetFilter() {
      type.value = "";
      stage.value = "";
      subject.value = "";
      sortKey.value = "latest";
      currentPage.value = 1;
      return loadList();
    }

    function setPage(page: number) {
      currentPage.value = page;
      return loadList();
    }

    async function loadDetail(id: string) {
      detailLoading.value = true;
      try {
        detail.value = await schoolExcellentAchievementsRepository.detail(
          userStore.currentTenant.id,
          id,
        );
      } finally {
        detailLoading.value = false;
      }
    }

    async function toggleLike(id: string) {
      detail.value = await schoolExcellentAchievementsRepository.toggleLike(
        userStore.currentTenant.id,
        id,
      );
      const row = rows.value.find((item) => item.id === id);
      if (row && detail.value) row.likeCount = detail.value.likeCount;
    }

    return {
      loading,
      detailLoading,
      rows,
      total,
      detail,
      type,
      stage,
      subject,
      sortKey,
      currentPage,
      pageSize,
      loadList,
      search,
      resetFilter,
      setPage,
      loadDetail,
      toggleLike,
    };
  },
);

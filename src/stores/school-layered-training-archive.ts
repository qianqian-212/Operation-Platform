import { ref } from "vue";
import { defineStore } from "pinia";
import { schoolTrainingArchiveRepository } from "@/features/school-layered-training-archive/school-training-archive-repository";
import type {
  SchoolTrainingArchiveCourse,
  SchoolTrainingArchiveCredit,
  SchoolTrainingArchiveProfile,
  SchoolTrainingArchiveProgress,
  SchoolTrainingArchiveQuery,
} from "@/features/school-layered-training-archive/types";
import { useUserStore } from "@/stores/user";

function emptyQuery(): SchoolTrainingArchiveQuery {
  return { bureau: "", semester: "" };
}

export const useSchoolTrainingArchiveStore = defineStore("school-layered-training-archive", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const query = ref(emptyQuery());
  const profile = ref<SchoolTrainingArchiveProfile | null>(null);
  const completed = ref<SchoolTrainingArchiveCourse[]>([]);
  const progress = ref<SchoolTrainingArchiveProgress[]>([]);
  const credits = ref<SchoolTrainingArchiveCredit[]>([]);

  async function load() {
    loading.value = true;
    try {
      const snapshot = await schoolTrainingArchiveRepository.load(userStore.currentTenant.id, query.value);
      profile.value = snapshot.profile;
      completed.value = snapshot.completed;
      progress.value = snapshot.progress;
      credits.value = snapshot.credits;
    } finally {
      loading.value = false;
    }
  }

  function search() {
    return load();
  }

  function reset() {
    query.value = emptyQuery();
    return load();
  }

  return { loading, query, profile, completed, progress, credits, load, search, reset };
});

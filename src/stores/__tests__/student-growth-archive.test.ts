import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useStudentGrowthArchiveStore } from "@/stores/student-growth-archive";
import { useUserStore } from "@/stores/user";

describe("student growth archive store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("defaults to the first school and keeps filters when returning via ensureInitialized", async () => {
    const userStore = useUserStore();
    userStore.$patch({
      currentTenant: {
        id: "bureau-demo",
        name: "演示教育局",
        shortName: "演示局",
        type: "bureau",
        administrativeRegion: {
          code: "440000",
          name: "广东省",
          scope: "province",
          path: [{ code: "440000", name: "广东省", scope: "province" }],
        },
      },
    });

    const store = useStudentGrowthArchiveStore();
    await store.ensureInitialized();
    expect(store.selectedSchoolId).toBe("virtual-primary-a");

    store.filterDraft.keyword = "陈";
    store.filterDraft.enrollmentStatus = "all";
    await store.applyFilters();
    store.setPage(1);
    const firstStudent = store.tableData[0];
    expect(firstStudent).toBeTruthy();

    store.setPageSize(10);
    if (store.pagination.total > 10) {
      store.setPage(2);
    }
    const pageBeforeDetail = store.pagination.currentPage;
    const keywordBeforeDetail = store.appliedFilter.keyword;
    const schoolBeforeDetail = store.selectedSchoolId;

    await store.ensureInitialized();
    expect(store.selectedSchoolId).toBe(schoolBeforeDetail);
    expect(store.appliedFilter.keyword).toBe(keywordBeforeDetail);
    expect(store.pagination.currentPage).toBe(pageBeforeDetail);
  });

  it("resets grade and class when switching schools but keeps keyword and status", async () => {
    const userStore = useUserStore();
    userStore.$patch({
      currentTenant: {
        id: "bureau-demo",
        name: "演示教育局",
        shortName: "演示局",
        type: "bureau",
        administrativeRegion: {
          code: "440000",
          name: "广东省",
          scope: "province",
          path: [{ code: "440000", name: "广东省", scope: "province" }],
        },
      },
    });

    const store = useStudentGrowthArchiveStore();
    await store.ensureInitialized();
    store.filterDraft.keyword = "林";
    store.filterDraft.enrollmentStatus = "all";
    store.filterDraft.grade = "四年级";
    store.filterDraft.classId = "virtual-primary-a-class-01";
    await store.applyFilters();

    await store.handleTreeNodeClick({
      id: "school:virtual-junior-a",
      label: "虚拟示范初中 A",
      kind: "school",
      schoolId: "virtual-junior-a",
    });

    expect(store.selectedSchoolId).toBe("virtual-junior-a");
    expect(store.filterDraft.keyword).toBe("林");
    expect(store.filterDraft.enrollmentStatus).toBe("all");
    expect(store.filterDraft.grade).toBe("全部年级");
    expect(store.filterDraft.classId).toBe("");
    expect(store.appliedFilter.keyword).toBe("林");
  });
});

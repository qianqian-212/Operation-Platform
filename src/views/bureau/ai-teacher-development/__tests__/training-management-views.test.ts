import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount, flushPromises } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { resetAchievementReviewMockData } from "@/features/training-achievement-review/mock-data";
import { useUserStore } from "@/stores/user";
import AchievementReviewView from "@/views/bureau/ai-teacher-development/AchievementReviewView.vue";
import TrainingStatisticsView from "@/views/bureau/ai-teacher-development/TrainingStatisticsView.vue";
import TrainingWarningSchoolDetailView from "@/views/bureau/ai-teacher-development/TrainingWarningSchoolDetailView.vue";
import TrainingWarningView from "@/views/bureau/ai-teacher-development/TrainingWarningView.vue";

async function mountWithRoute(
  path: string,
  component: object,
  params: Record<string, string> = {},
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { name: "target", path, component },
      {
        path: "/bureau/ai-teacher-development/teaching-monitoring/warnings",
        component: TrainingWarningView,
      },
    ],
  });
  await router.push(
    Object.keys(params).length > 0 ? { name: "target", params } : path,
  );
  await router.isReady();
  return mount(component, {
    global: {
      plugins: [ElementPlus, router],
      stubs: { teleport: true, transition: false },
    },
  });
}

describe("bureau training management views", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
    resetAchievementReviewMockData();
  });

  it("renders achievement final review stats, tabs and actions", async () => {
    const wrapper = await mountWithRoute(
      "/bureau/ai-teacher-development/teaching-monitoring/achievement-review",
      AchievementReviewView,
    );
    await flushPromises();
    expect(wrapper.text()).toContain("待我终审");
    expect(wrapper.text()).toContain("本月已通过");
    expect(wrapper.text()).toContain("已加精成果");
    expect(wrapper.text()).toContain("待终审");
    expect(wrapper.text()).toContain("已通过");
    expect(wrapper.text()).toContain("已驳回");
    expect(wrapper.text()).toContain("基于核心素养的单元整体教学研究");
    expect(wrapper.text()).toContain("审核");
  });

  it("renders warning management banner and school table", async () => {
    const wrapper = await mountWithRoute(
      "/bureau/ai-teacher-development/teaching-monitoring/warnings",
      TrainingWarningView,
    );
    await flushPromises();
    expect(wrapper.text()).toContain("教师学分未达标");
    expect(wrapper.text()).toContain("教师总数");
    expect(wrapper.text()).toContain("整体达标率");
    expect(wrapper.text()).toContain("阳光小学");
    expect(wrapper.text()).toContain("详情");
  });

  it("renders school teacher credit detail", async () => {
    const wrapper = await mountWithRoute(
      "/bureau/ai-teacher-development/teaching-monitoring/warnings/:schoolId",
      TrainingWarningSchoolDetailView,
      { schoolId: "sch-1" },
    );
    await flushPromises();
    expect(wrapper.text()).toContain("教师学分详情");
    expect(wrapper.text()).toContain("当前学分");
    expect(wrapper.text()).toContain("查看明细");
  });

  it("renders training statistics overview and export action", async () => {
    const wrapper = await mountWithRoute(
      "/bureau/ai-teacher-development/teaching-monitoring/statistics",
      TrainingStatisticsView,
    );
    await flushPromises();
    expect(wrapper.text()).toContain("本年成果总数");
    expect(wrapper.text()).toContain("教师总数");
    expect(wrapper.text()).toContain("整体达标率");
    expect(wrapper.text()).toContain("导出明细");
    expect(wrapper.text()).toContain("阳光小学");
  });
});

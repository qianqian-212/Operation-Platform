import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount, flushPromises } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { resetActivityMockData } from "@/features/cross-school-activity/mock-data";
import { resetAllianceMockData } from "@/features/teaching-research-alliance/mock-data";
import { useUserStore } from "@/stores/user";
import CrossSchoolActivityDetailView from "@/views/bureau/ai-teacher-development/CrossSchoolActivityDetailView.vue";
import CrossSchoolActivityView from "@/views/bureau/ai-teacher-development/CrossSchoolActivityView.vue";
import CreateCrossSchoolActivityView from "@/views/bureau/ai-teacher-development/CreateCrossSchoolActivityView.vue";

const listPath = "/bureau/ai-teacher-development/cross-school-research/activities";

async function mountPage(component: unknown, path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: listPath, component: CrossSchoolActivityView },
      { path: `${listPath}/create`, component: CreateCrossSchoolActivityView },
      { path: `${listPath}/:id`, component: CrossSchoolActivityDetailView },
    ],
  });
  await router.push(path);
  await router.isReady();
  return mount(component, {
    global: {
      plugins: [ElementPlus, router],
      stubs: { teleport: true, transition: false },
    },
  });
}

describe("cross-school activity views", () => {
  beforeEach(() => {
    resetAllianceMockData();
    resetActivityMockData();
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
  });

  it("renders the activity list with screenshot seed rows", async () => {
    const wrapper = await mountPage(CrossSchoolActivityView, listPath);
    await flushPromises();
    expect(wrapper.text()).toContain("跨校教研活动");
    expect(wrapper.text()).toContain("牵头学校统筹组织跨校教研活动");
    expect(wrapper.text()).toContain("跨校集体备课·小学语文三年级《富饶的西沙群岛》");
    expect(wrapper.text()).toContain("5人/5校");
    expect(wrapper.text()).toContain("详情");
  });

  it("renders the create form sections for lesson prep", async () => {
    const wrapper = await mountPage(CreateCrossSchoolActivityView, `${listPath}/create`);
    await flushPromises();
    expect(wrapper.text()).toContain("创建跨校教研活动");
    expect(wrapper.text()).toContain("活动基本信息");
    expect(wrapper.text()).toContain("参与学校与教师");
    expect(wrapper.text()).toContain("集体备课 · 课题信息");
    expect(wrapper.text()).toContain("任务分工");
  });

  it("renders activity detail overview matching the seed record", async () => {
    const wrapper = await mountPage(
      CrossSchoolActivityDetailView,
      `${listPath}/activity-chinese`,
    );
    await flushPromises();
    expect(wrapper.text()).toContain("跨校集体备课·小学语文三年级《富饶的西沙群岛》");
    expect(wrapper.text()).toContain("阳光小学·教研楼302（线上同步）");
    expect(wrapper.text()).toContain("陈豪东");
    expect(wrapper.text()).toContain("城东学区教研联盟");
    expect(wrapper.text()).toContain("参与教师（跨校）");
  });
});

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
    expect(wrapper.text()).toContain("9人/5校");
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

  it("renders activity detail summary and task cards matching the seed record", async () => {
    const wrapper = await mountPage(
      CrossSchoolActivityDetailView,
      `${listPath}/activity-chinese`,
    );
    await flushPromises();
    expect(wrapper.text()).toContain("活动管理");
    expect(wrapper.text()).toContain("活动详情");
    expect(wrapper.text()).toContain("跨校集体备课·小学语文三年级《富饶的西沙群岛》");
    expect(wrapper.text()).toContain("阳光小学·教研楼302（线上同步）");
    expect(wrapper.text()).toContain("陈豪东");
    expect(wrapper.text()).toContain("城东学区教研联盟");
    expect(wrapper.text()).toContain("参与教师（跨校）");
    expect(wrapper.text()).toContain("任务分工");
    expect(wrapper.text()).toContain("听评课设置");
    expect(wrapper.text()).toContain("主备教案·第一课时");
    expect(wrapper.text()).toContain("最终版");
    expect(wrapper.text()).toContain("待提交");
    expect(wrapper.text()).not.toContain("概览");
  });

  it("renders the observation settings form on the detail tab", async () => {
    const wrapper = await mountPage(
      CrossSchoolActivityDetailView,
      `${listPath}/activity-chinese`,
    );
    await flushPromises();
    const panes = wrapper.findAll(".el-tabs__item");
    const observationTab = panes.find((pane) => pane.text() === "听评课设置");
    expect(observationTab).toBeTruthy();
    await observationTab?.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("课程名称");
    expect(wrapper.text()).toContain("授课老师");
    expect(wrapper.text()).toContain("评课老师从联盟成员学校的教师中选择");
    expect(wrapper.text()).toContain("线下评课");
    expect(wrapper.text()).toContain("直播评课");
    expect(wrapper.text()).toContain("视频评课");
  });
});

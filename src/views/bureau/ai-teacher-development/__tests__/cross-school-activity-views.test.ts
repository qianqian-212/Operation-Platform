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
    expect(wrapper.get(".toolbar-title").text()).toBe("活动管理");
    expect(wrapper.text()).toContain("牵头学校统筹组织跨校教研活动");
    expect(wrapper.text()).toContain("跨校集体备课·小学语文三年级《富饶的西沙群岛》");
    expect(wrapper.text()).toContain("9人/5校");
    expect(wrapper.text()).toContain("详情");
    expect(wrapper.get(".filter-fields").classes()).toContain("is-four-columns");
  });

  it("renders the create form sections for lesson prep", async () => {
    const wrapper = await mountPage(CreateCrossSchoolActivityView, `${listPath}/create`);
    await flushPromises();
    expect(wrapper.text()).toContain("创建跨校教研活动");
    expect(wrapper.text()).toContain("基本信息");
    expect(wrapper.text()).toContain("参与学校与教师");
    expect(wrapper.text()).toContain("集体备课课题信息");
    expect(wrapper.text()).toContain("任务分工");
    expect(wrapper.text()).toContain("集体备课和听评课为默认任务");
    expect(wrapper.text()).toContain("集体备课");
    expect(wrapper.text()).toContain("听评课");
    expect(wrapper.text()).toContain("添加任务");
    expect(wrapper.text()).toContain("文件上传");
    expect(wrapper.text()).toContain("参与教师");
    expect(wrapper.text()).toContain("活动描述");
    expect(wrapper.text()).toContain("可多选，支持同时开展集体备课与听评课");
    expect(wrapper.text()).not.toContain("听评课设置");
  });

  it("shows observation settings after checking 听评课", async () => {
    const wrapper = await mountPage(CreateCrossSchoolActivityView, `${listPath}/create`);
    await flushPromises();
    const observationBox = wrapper.findAll(".el-checkbox").find((item) => item.text() === "听评课");
    expect(observationBox).toBeTruthy();
    await observationBox?.find("input").setValue();
    await flushPromises();
    expect(wrapper.text()).toContain("听评课设置");
    expect(wrapper.text()).toContain("课程名称");
    expect(wrapper.html()).toContain("请选择节数");
    expect(wrapper.text()).toContain("集体备课课题信息");
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
    expect(wrapper.text()).toContain("文件");
    expect(wrapper.text()).toContain("文本");
    expect(wrapper.get(".task-kind.is-file").text()).toBe("文件");
    expect(wrapper.get(".task-kind.is-text").text()).toBe("文本");
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
    expect(wrapper.text()).toContain("学科/年级");
    expect(wrapper.html()).toContain("请选择节数");
    expect(wrapper.text()).toContain("线下评课");
    expect(wrapper.text()).toContain("直播评课");
    expect(wrapper.text()).toContain("视频评课");
  });

  it("keeps discussion and archive tabs empty", async () => {
    const wrapper = await mountPage(
      CrossSchoolActivityDetailView,
      `${listPath}/activity-chinese`,
    );
    await flushPromises();
    const panes = wrapper.findAll(".el-tabs__item");
    const discussionTab = panes.find((pane) => pane.text() === "讨论投票");
    await discussionTab?.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("讨论投票功能即将开放");
    const archiveTab = panes.find((pane) => pane.text() === "归档管理");
    await archiveTab?.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("归档管理功能即将开放");
  });
});

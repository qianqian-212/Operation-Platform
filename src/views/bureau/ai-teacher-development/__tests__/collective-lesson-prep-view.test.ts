import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount, flushPromises } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import CollectiveLessonPrepView from "@/views/bureau/ai-teacher-development/CollectiveLessonPrepView.vue";

const listPath = "/bureau/ai-teacher-development/cross-school-research/lesson-prep";
const activityPath = "/bureau/ai-teacher-development/cross-school-research/activities/:id";

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: listPath, component: CollectiveLessonPrepView },
      { path: activityPath, component: { template: "<div>activity</div>" } },
    ],
  });
  await router.push(listPath);
  await router.isReady();
  return {
    router,
    wrapper: mount(CollectiveLessonPrepView, {
      global: {
        plugins: [ElementPlus, router],
        stubs: { teleport: true, transition: false },
      },
    }),
  };
}

describe("collective lesson prep view", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
  });

  it("renders screenshot stats, first-unit cards and associated activity", async () => {
    const { wrapper } = await mountPage();
    await flushPromises();
    expect(wrapper.get("h1").text()).toBe("集体备课管理");
    expect(wrapper.text()).toContain("备课总数");
    expect(wrapper.text()).toContain("12");
    expect(wrapper.text()).toContain("进行中");
    expect(wrapper.text()).toContain("已完成");
    expect(wrapper.text()).toContain("待开始");
    expect(wrapper.text()).toContain("第一单元");
    expect(wrapper.text()).toContain("第1课 沁园春·长沙/...");
    expect(wrapper.text()).toContain("《沁园春。长沙》");
    expect(wrapper.findAll(".prep-card")).toHaveLength(3);
    expect(wrapper.text()).toContain("大青树下的小学");
    expect(wrapper.text()).toContain("城东学区教研联盟");
    expect(wrapper.text()).toContain("王老师（阳光小学）");
    expect(wrapper.text()).toContain("王老师（智慧校园阳光小学）");
    expect(wrapper.text()).toContain("跨校集体备课·小学语文三年级《富饶的西沙群岛》");
    expect(wrapper.text()).toContain("65%");
    expect(wrapper.text()).toContain("备课进度100%");
    expect(wrapper.text()).toContain("已产出3份成果");
    expect(wrapper.text()).toContain("进入备课");
    expect(wrapper.text()).toContain("发起备课");
  });

  it("collapses the curriculum tree from the toolbar icon", async () => {
    const { wrapper } = await mountPage();
    await flushPromises();
    const toggle = wrapper.get('[aria-controls="collective-lesson-prep-tree"]');
    expect(wrapper.find("#collective-lesson-prep-tree").exists()).toBe(true);
    await toggle.trigger("click");
    await flushPromises();
    expect(wrapper.find("#collective-lesson-prep-tree").exists()).toBe(false);
    expect(toggle.attributes("aria-expanded")).toBe("false");
    expect(toggle.attributes("aria-label")).toBe("展开教材目录");
  });

  it("does not navigate from 发起备课 or 进入备课", async () => {
    const { wrapper, router } = await mountPage();
    await flushPromises();
    const createButton = wrapper.findAll(".el-button").find((button) => (
      button.text().includes("发起备课")
    ));
    const enterButton = wrapper.findAll(".el-button").find((button) => (
      button.text().includes("进入备课")
    ));
    expect(createButton).toBeTruthy();
    expect(enterButton).toBeTruthy();
    await createButton?.trigger("click");
    await enterButton?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(listPath);
  });

  it("opens the associated activity from 关联活动", async () => {
    const { wrapper, router } = await mountPage();
    await flushPromises();
    await wrapper.get(".activity-link").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(
      "/bureau/ai-teacher-development/cross-school-research/activities/activity-chinese",
    );
  });
});

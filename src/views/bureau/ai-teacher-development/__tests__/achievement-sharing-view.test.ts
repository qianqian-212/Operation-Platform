import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount, flushPromises } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import AchievementSharingView from "@/views/bureau/ai-teacher-development/AchievementSharingView.vue";

const listPath = "/bureau/ai-teacher-development/cross-school-research/achievement-sharing";

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: listPath, component: AchievementSharingView }],
  });
  await router.push(listPath);
  await router.isReady();
  return mount(AchievementSharingView, {
    global: {
      plugins: [ElementPlus, router],
      stubs: { teleport: true, transition: false },
    },
  });
}

describe("achievement sharing view", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
  });

  it("renders design stats, first-unit cards and upload action", async () => {
    const wrapper = await mountPage();
    await flushPromises();
    expect(wrapper.get("h1").text()).toBe("成果共享");
    expect(wrapper.text()).toContain("成果总数");
    expect(wrapper.text()).toContain("教案课件数");
    expect(wrapper.text()).toContain("研究论文数");
    expect(wrapper.text()).toContain("总下载数");
    expect(wrapper.text()).toContain("第一单元");
    expect(wrapper.findAll(".share-card")).toHaveLength(4);
    expect(wrapper.text()).toContain("《富饶的西沙群岛》跨校集体备课教案集");
    expect(wrapper.text()).toContain("联盟内共享");
    expect(wrapper.text()).toContain("教案");
    expect(wrapper.text()).toContain("下载次数：100");
    expect(wrapper.text()).toContain("上传成果");
    expect(wrapper.text()).toContain("预览");
  });

  it("collapses the curriculum tree from the toolbar icon", async () => {
    const wrapper = await mountPage();
    await flushPromises();
    const toggle = wrapper.get('[aria-controls="achievement-sharing-tree"]');
    expect(wrapper.find("#achievement-sharing-tree").exists()).toBe(true);
    await toggle.trigger("click");
    await flushPromises();
    expect(wrapper.find("#achievement-sharing-tree").exists()).toBe(false);
  });
});

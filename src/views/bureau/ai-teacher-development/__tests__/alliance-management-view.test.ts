import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { resetAllianceMockData } from "@/features/teaching-research-alliance/mock-data";
import { useUserStore } from "@/stores/user";
import AllianceManagementView from "@/views/bureau/ai-teacher-development/AllianceManagementView.vue";

const listPath = "/bureau/ai-teacher-development/cross-school-research/alliance";

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: listPath, component: AllianceManagementView }],
  });
  await router.push(listPath);
  await router.isReady();
  return mount(AllianceManagementView, {
    global: {
      plugins: [ElementPlus, router],
      stubs: { teleport: true, transition: false },
    },
  });
}

describe("alliance management view", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetAllianceMockData();
    useUserStore().currentTenant.id = "bureau-001";
  });

  it("renders overview stat cards matching the lesson-prep layout", async () => {
    const wrapper = await mountPage();
    await flushPromises();
    expect(wrapper.text()).toContain("教研联盟");
    expect(wrapper.text()).toContain("参与学校");
    expect(wrapper.text()).toContain("跨校活动");
    expect(wrapper.text()).toContain("参与教师");
    expect(wrapper.findAll(".stat-card")).toHaveLength(4);
    expect(wrapper.findAll(".stat-icon")).toHaveLength(4);
    expect(wrapper.findAll(".stat-glyph")).toHaveLength(4);
    expect(wrapper.get(".stat-icon").classes()).toContain("is-alliances");
    expect(wrapper.get(".stat-card .stat-value strong").text()).toBe("3");
  });
});

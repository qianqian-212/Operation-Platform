import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount, flushPromises } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import EffectEvaluationView from "@/views/bureau/ai-teacher-development/EffectEvaluationView.vue";

const listPath = "/bureau/ai-teacher-development/cross-school-research/effect-evaluation";

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: listPath, component: EffectEvaluationView }],
  });
  await router.push(listPath);
  await router.isReady();
  return mount(EffectEvaluationView, {
    global: {
      plugins: [ElementPlus, router],
      stubs: { teleport: true, transition: false },
    },
  });
}

describe("effect evaluation view", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
  });

  it("renders design title, stats, metrics and school table", async () => {
    const wrapper = await mountPage();
    await flushPromises();
    expect(wrapper.get("h1").text()).toBe("跨校教研效果评估");
    expect(wrapper.text()).toContain("导出报告");
    expect(wrapper.text()).toContain("总学校数");
    expect(wrapper.text()).toContain("参与学校");
    expect(wrapper.text()).toContain("未参与学校");
    expect(wrapper.text()).toContain("获奖提升率");
    expect(wrapper.text()).toContain("248%");
    expect(wrapper.text()).toContain("核心指标对比");
    expect(wrapper.text()).toContain("竞赛获奖");
    expect(wrapper.text()).toContain("42次");
    expect(wrapper.text()).toContain("8.25 次/年");
    expect(wrapper.text()).toContain("学校维度对比");
    expect(wrapper.text()).toContain("阳光小学");
    expect(wrapper.text()).toContain("参与");
    expect(wrapper.text()).toContain("未参与");
  });
});

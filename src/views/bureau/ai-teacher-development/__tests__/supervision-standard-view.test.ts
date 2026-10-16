import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { resetSupervisionStandardMockData } from "@/features/layered-training-supervision/mock-data";
import { layeredTrainingSupervisionRepository } from "@/features/layered-training-supervision/layered-training-supervision-repository";
import { SUPERVISION_REMINDER_NOTE } from "@/features/layered-training-supervision/types";
import { useUserStore } from "@/stores/user";
import SupervisionStandardView from "@/views/bureau/ai-teacher-development/SupervisionStandardView.vue";

function mountView() {
  return mount(SupervisionStandardView, {
    global: {
      plugins: [ElementPlus],
      stubs: { teleport: true, transition: false },
    },
  });
}

describe("supervision standard view", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
    resetSupervisionStandardMockData();
  });

  it("renders slow progress and credit standards with defaults", async () => {
    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain("进度缓慢标准");
    expect(wrapper.text()).toContain("学分达标标准");
    expect(wrapper.text()).toContain("进度缓慢判定天数");
    expect(wrapper.text()).toContain("通知周期");
    expect(wrapper.text()).toContain("学期达标线（学分）");
    expect(wrapper.text()).toContain("达标预警触发比例");
    expect(wrapper.text()).toContain("14天");
    expect(wrapper.text()).toContain("60%");
    expect(wrapper.get("#semester-credit-line").element).toHaveProperty("value", "12");
    expect(wrapper.text()).toContain(SUPERVISION_REMINDER_NOTE);
    expect(wrapper.text()).toContain("保存设置");
    expect(wrapper.text()).toContain("恢复默认");
  });

  it("saves edited standards and restores defaults", async () => {
    const wrapper = mountView();
    await flushPromises();

    await wrapper.get('[aria-label="增加进度缓慢判定天数"]').trigger("click");
    await wrapper.get("#semester-credit-line").setValue("18");
    await wrapper.get("button.el-button--primary").trigger("click");
    await flushPromises();

    const saved = await layeredTrainingSupervisionRepository.load("bureau-001");
    expect(saved).toMatchObject({ slowProgressDays: 15, semesterCreditLine: 18 });

    const restore = wrapper.findAll("button").find((button) => button.text() === "恢复默认");
    if (!restore) throw new Error("缺少恢复默认按钮");
    await restore.trigger("click");
    await flushPromises();

    const restored = await layeredTrainingSupervisionRepository.load("bureau-001");
    expect(restored).toMatchObject({
      slowProgressDays: 14,
      noticeCycleDays: 14,
      semesterCreditLine: 12,
      warningTriggerPercent: 60,
    });
    expect(wrapper.text()).toContain("14天");
    expect(wrapper.get("#semester-credit-line").element).toHaveProperty("value", "12");
  });

  it("keeps the saved credit line when the entered value is out of range", async () => {
    const wrapper = mountView();
    await flushPromises();

    await wrapper.get("#semester-credit-line").setValue("999");
    await wrapper.get("button.el-button--primary").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("学期达标线需在 1-200 之间");
    const stored = await layeredTrainingSupervisionRepository.load("bureau-001");
    expect(stored.semesterCreditLine).toBe(12);
  });
});

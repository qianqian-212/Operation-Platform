import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { useUserStore } from "@/stores/user";
import LayeredTrainingOverviewView from "@/views/bureau/ai-teacher-development/LayeredTrainingOverviewView.vue";

describe("layered training overview view", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
  });

  it("renders the semester summary, school cards and teacher ledger", async () => {
    const wrapper = mount(LayeredTrainingOverviewView, {
      global: { plugins: [ElementPlus] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("学期：");
    expect(wrapper.text()).toContain("教师总数");
    expect(wrapper.text()).toContain("856");
    expect(wrapper.text()).toContain("85%");
    expect(wrapper.text()).toContain("80%");
    expect(wrapper.text()).toContain("30人未达标");
    expect(wrapper.text()).toContain("450/486人参与");
    expect(wrapper.text()).toContain("覆盖8所学校");
    expect(wrapper.text()).toContain("学校维度");
    expect(wrapper.text()).toContain("教师维度");
    expect(wrapper.text()).toContain("按达标率排序");
    expect(wrapper.get("#pane-schools").isVisible()).toBe(true);
    expect(wrapper.get("#pane-teachers").isVisible()).toBe(false);
    expect(wrapper.get("#pane-schools").text()).toContain("阳光小学");
    expect(wrapper.get("#pane-schools").text()).toContain("详情");
    await wrapper.get("#pane-schools").find(".action-link").trigger("click");
    await flushPromises();
    expect(wrapper.get("#pane-schools").isVisible()).toBe(true);
    expect(wrapper.get("#pane-teachers").isVisible()).toBe(false);

    await openTeacherTab(wrapper);
    expect(wrapper.get("#pane-teachers").text()).toContain("张小明");
    expect(wrapper.get("#pane-teachers").text()).toContain("24/36");
    expect(wrapper.get("#pane-teachers").text()).toContain("进行中");
    expect(wrapper.get("#pane-teachers").text()).toContain("450");
  });

  it("filters school cards by name and teachers by subject", async () => {
    const wrapper = mount(LayeredTrainingOverviewView, {
      global: { plugins: [ElementPlus] },
    });
    await flushPromises();

    await wrapper.findComponent({ name: "ElInput" }).setValue("实验小学");
    await flushPromises();
    expect(wrapper.get("#pane-schools").text()).toContain("阳光小学");
    const search = wrapper.get("#pane-schools").findAll("button").find((item) => item.text() === "搜索");
    expect(search).toBeTruthy();
    await search?.trigger("click");
    await flushPromises();
    expect(wrapper.get("#pane-schools").text()).toContain("实验小学");
    expect(wrapper.get("#pane-schools").text()).not.toContain("阳光小学");

    await openTeacherTab(wrapper);
    const subjectSelect = wrapper.get("#pane-teachers").findAllComponents({ name: "ElSelect" })[1];
    expect(subjectSelect).toBeTruthy();
    await subjectSelect?.setValue("英语");
    const teacherSearch = wrapper
      .get("#pane-teachers")
      .findAll("button")
      .find((item) => item.text() === "搜索");
    expect(teacherSearch).toBeTruthy();
    await teacherSearch?.trigger("click");
    await flushPromises();
    expect(wrapper.get("#pane-teachers").text()).toContain("王刚");
    expect(wrapper.get("#pane-teachers").text()).not.toContain("张小明");
  });
});

async function openTeacherTab(wrapper: ReturnType<typeof mount>) {
  const teacherTab = wrapper.findAll(".el-tabs__item").find((item) => item.text() === "教师维度");
  expect(teacherTab).toBeTruthy();
  await teacherTab?.trigger("click");
  await flushPromises();
}

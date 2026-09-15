import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount, flushPromises } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { resetLessonObservationMockData } from "@/features/lesson-observation/mock-data";
import { useUserStore } from "@/stores/user";
import LessonObservationDetailView from "@/views/bureau/ai-teacher-development/LessonObservationDetailView.vue";
import LessonObservationView from "@/views/bureau/ai-teacher-development/LessonObservationView.vue";

const listPath = "/bureau/ai-teacher-development/cross-school-research/lesson-observation";
const detailPath = `${listPath}/:id`;

async function mountPage(component: unknown, path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: listPath, component: LessonObservationView },
      { path: detailPath, component: LessonObservationDetailView },
    ],
  });
  await router.push(path);
  await router.isReady();
  return {
    router,
    wrapper: mount(component, {
      global: {
        plugins: [ElementPlus, router],
        stubs: { teleport: true, transition: false },
      },
    }),
  };
}

describe("lesson observation views", () => {
  beforeEach(() => {
    resetLessonObservationMockData();
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
  });

  it("renders screenshot list filters, seed rows and padded indexes", async () => {
    const { wrapper } = await mountPage(LessonObservationView, listPath);
    await flushPromises();
    expect(wrapper.get(".toolbar-title").text()).toBe("跨校听评课");
    expect(wrapper.text()).toContain("老师");
    expect(wrapper.text()).toContain("联盟");
    expect(wrapper.text()).toContain("学校");
    expect(wrapper.text()).toContain("方式");
    expect(wrapper.text()).toContain("时间");
    expect(wrapper.text()).toContain("新增");
    expect(wrapper.text()).toContain("卖火柴的小女孩");
    expect(wrapper.text()).toContain("钱佳益");
    expect(wrapper.text()).toContain("阳光小学");
    expect(wrapper.text()).toContain("2023-06-05 第二节");
    expect(wrapper.text()).toContain("一年级/语文");
    expect(wrapper.text()).toContain("线下评课");
    expect(wrapper.text()).toContain("教师通用评价表");
    expect(wrapper.text()).toContain("94");
    expect(wrapper.text()).toContain("圆的认识");
    expect(wrapper.text()).toContain("直播评课");
    expect(wrapper.text()).toContain("射线、直线和线段");
    expect(wrapper.text()).toContain("01");
    expect(wrapper.text()).toContain("详情");
    expect(wrapper.get(".filter-fields").classes()).toContain("is-four-columns");
  });

  it("does not navigate from 新增", async () => {
    const { wrapper, router } = await mountPage(LessonObservationView, listPath);
    await flushPromises();
    const createButton = wrapper.findAll(".el-button").find((button) => button.text().includes("新增"));
    expect(createButton).toBeTruthy();
    await createButton?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(listPath);
  });

  it("opens screenshot detail from the first course name", async () => {
    const { wrapper, router } = await mountPage(LessonObservationView, listPath);
    await flushPromises();
    const courseLink = wrapper.findAll(".action-link").find((item) => (
      item.text() === "卖火柴的小女孩"
    ));
    expect(courseLink).toBeTruthy();
    await courseLink?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(`${listPath}/obs-matchgirl`);
  });

  it("renders detail summary, report, reviewers and archives", async () => {
    const { wrapper } = await mountPage(
      LessonObservationDetailView,
      `${listPath}/obs-matchgirl`,
    );
    await flushPromises();
    expect(wrapper.text()).toContain("听评课管理");
    expect(wrapper.text()).toContain("听评课详情");
    expect(wrapper.get("h1").text()).toBe("卖火柴的小女孩");
    expect(wrapper.text()).toContain("钱佳益（阳光小学）");
    expect(wrapper.text()).toContain("城东学区教研联盟");
    expect(wrapper.text()).toContain("教师通用评价表");
    expect(wrapper.text()).toContain("张小小、陈果果、李木木、罗小言、何天天");
    expect(wrapper.text()).toContain("总分100分");
    expect(wrapper.text()).toContain("3人已评");
    expect(wrapper.text()).toContain("课程评价报告");
    expect(wrapper.text()).toContain("评课明细");
    expect(wrapper.text()).toContain("导出报告");
    expect(wrapper.text()).toContain("教学内容准确，教学容量适度");
    expect(wrapper.text()).toContain("总得分");
    expect(wrapper.text()).toContain("档案文件");
    expect(wrapper.text()).toContain("测试听课-评课明细报告.pdf");
    expect(wrapper.text()).toContain("测试听课-课程资料.zip");

    const reviewerTab = wrapper.findAll(".report-tab").find((item) => (
      item.text() === "评课明细"
    ));
    expect(reviewerTab).toBeTruthy();
    await reviewerTab?.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("文德小学");
    expect(wrapper.text()).toContain("重点突出，学生参与度高。");
    expect(wrapper.text()).toContain("暂无评语");
  });
});

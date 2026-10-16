import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import ElementPlus, { ElMessage } from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { resetLayeredTrainingCourseReviewMockData } from "@/features/layered-training-course-review/mock-data";
import { useUserStore } from "@/stores/user";
import LayeredTrainingCourseReviewDetailView from "@/views/bureau/ai-teacher-development/LayeredTrainingCourseReviewDetailView.vue";
import LayeredTrainingCourseReviewView from "@/views/bureau/ai-teacher-development/LayeredTrainingCourseReviewView.vue";
import LayeredTrainingNoticeView from "@/views/bureau/ai-teacher-development/LayeredTrainingNoticeView.vue";

const noticePath = "/bureau/ai-teacher-development/layered-training/notices";
const reviewPath = "/bureau/ai-teacher-development/layered-training/course-review";

async function mountPage(path: string, component: object, params: Record<string, string> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { name: "notices", path: noticePath, component: LayeredTrainingNoticeView },
      { name: "review", path: reviewPath, component: LayeredTrainingCourseReviewView },
      {
        name: "review-detail",
        path: `${reviewPath}/:id`,
        component: LayeredTrainingCourseReviewDetailView,
      },
    ],
  });
  await router.push(Object.keys(params).length > 0 ? { name: "review-detail", params } : path);
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

describe("layered training bureau views", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
    resetLayeredTrainingCourseReviewMockData();
  });

  it("renders the notice ledger and seeded row", async () => {
    const { wrapper } = await mountPage(noticePath, LayeredTrainingNoticeView);
    await flushPromises();
    expect(wrapper.text()).not.toContain("通知机制：");
    expect(wrapper.text()).toContain("通知流水记录");
    expect(wrapper.text()).toContain("王刚");
    expect(wrapper.text()).toContain("周期复查通知");
    expect(wrapper.text()).toContain("仍未达标");
    expect(wrapper.text()).toContain("128");
  });

  it("opens course review detail from the pending list", async () => {
    const { wrapper, router } = await mountPage(reviewPath, LayeredTrainingCourseReviewView);
    await flushPromises();
    expect(wrapper.text()).not.toContain("审核权限：");
    expect(wrapper.text()).toContain("待审核 (3)");
    expect(wrapper.text()).toContain("已通过 (18)");
    expect(wrapper.text()).toContain("已驳回 (2)");
    expect(wrapper.text()).toContain("整本书阅读指导策略");
    const review = wrapper.findAll("button").find((item) => item.text() === "审核");
    expect(review).toBeTruthy();
    await review?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(`${reviewPath}/ltc-001`);
  });

  it("requires a reject reason and returns to the list after approval", async () => {
    const warning = vi.spyOn(ElMessage, "warning").mockReturnValue({ close() {} });
    const { wrapper, router } = await mountPage(
      `${reviewPath}/ltc-001`,
      LayeredTrainingCourseReviewDetailView,
      { id: "ltc-001" },
    );
    await flushPromises();
    expect(wrapper.text()).toContain("审核详情");
    expect(wrapper.text()).toContain("选书标准与阅读计划");
    expect(wrapper.text()).toContain("在线查看");
    const reject = wrapper.findAll("button").find((item) => item.text() === "驳回");
    await reject?.trigger("click");
    await flushPromises();
    expect(warning).toHaveBeenCalledWith("驳回时必须填写驳回原因");
    expect(router.currentRoute.value.path).toBe(`${reviewPath}/ltc-001`);

    const approve = wrapper.findAll("button").find((item) => item.text() === "通过");
    await approve?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(reviewPath);
    warning.mockRestore();
  });
});

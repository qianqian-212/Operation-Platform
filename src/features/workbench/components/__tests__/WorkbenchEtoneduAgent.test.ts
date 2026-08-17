import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import ElementPlus from "element-plus";
import WorkbenchEtoneduAgent from "@/features/workbench/components/WorkbenchEtoneduAgent.vue";
import { useAiAssistantStore } from "@/stores/ai-assistant";
import { useUserStore } from "@/stores/user";

describe("WorkbenchEtoneduAgent", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders the designed prompt surface and sends the typed question to the assistant", async () => {
    const userStore = useUserStore();
    userStore.userInfo.id = "user-agent";
    userStore.currentTenant.id = "school-agent";
    const assistantStore = useAiAssistantStore();
    const initialize = vi.spyOn(assistantStore, "initialize").mockResolvedValue();
    const sendMessage = vi.spyOn(assistantStore, "sendMessage").mockResolvedValue(true);

    const wrapper = mount(WorkbenchEtoneduAgent, {
      props: { data: { kind: "agent" } },
      global: { plugins: [ElementPlus] },
    });

    expect(wrapper.get("#etonedu-agent-title").attributes("aria-label")).toBe("Etonedu Agent");
    const logo = wrapper.get(".agent-logo").element;
    expect(logo).toBeInstanceOf(HTMLVideoElement);
    if (logo instanceof HTMLVideoElement) {
      expect(logo.autoplay).toBe(true);
      expect(logo.loop).toBe(true);
      expect(logo.muted).toBe(true);
      expect(logo.playsInline).toBe(true);
    }
    expect(wrapper.text()).toContain("填入教育管理方案");
    expect(wrapper.text()).toContain("输入任务或教务问题，AI 会解析并给出解答");
    expect(wrapper.get("textarea").attributes("placeholder"))
      .toBe("例如：智慧课堂 如何查看班级到课率");
    expect(wrapper.get(".agent-thinking").attributes("aria-label")).toBe("选择推理模式：深度思考");
    expect(wrapper.get('button[aria-label="发送"]').attributes("disabled")).toBeDefined();

    await wrapper.get("textarea").setValue("帮我梳理本周待办");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(assistantStore.isOpen).toBe(true);
    expect(initialize).toHaveBeenCalledWith({
      tenantId: "school-agent",
      userId: "user-agent",
    });
    expect(sendMessage).toHaveBeenCalledWith("帮我梳理本周待办");
    expect(wrapper.get("textarea").element.value).toBe("");
  });
});

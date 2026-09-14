import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import CreateAllianceMemberSections from "@/views/bureau/ai-teacher-development/CreateAllianceMemberSections.vue";

const schools = [{ id: "s1", name: "阳光小学", stage: "primary" as const, district: "城东" }];
const teachers = [
  { id: "t1", name: "陈豪东", schoolId: "s1", subject: "语文", roleLabel: "教师" },
  { id: "t2", name: "李明华", schoolId: "s2", subject: "数学", roleLabel: "教师" },
];

function mountSections(leadSchoolId = "", adminId = "") {
  return mount(CreateAllianceMemberSections, {
    props: { schools, leadSchoolId, adminId, teachers },
    global: { plugins: [ElementPlus] },
  });
}

describe("create alliance member sections", () => {
  it("keeps the admin select disabled until the lead school has teachers", () => {
    const wrapper = mountSections();
    expect(wrapper.text()).toContain("联盟管理员");
    expect(wrapper.text()).toContain("从牵头学校教师名单中选择联盟管理员");
    const adminSelect = wrapper.findAllComponents({ name: "ElSelect" })[1];
    expect(adminSelect?.props("disabled")).toBe(true);
  });

  it("only offers selected teachers from the lead school", () => {
    const wrapper = mountSections("s1");
    const labels = wrapper.findAllComponents({ name: "ElOption" }).map((item) => item.props("label"));
    expect(labels).toContain("陈豪东");
    expect(labels).not.toContain("李明华");
    expect(wrapper.findAllComponents({ name: "ElSelect" })[1]?.props("disabled")).toBe(false);
  });
});

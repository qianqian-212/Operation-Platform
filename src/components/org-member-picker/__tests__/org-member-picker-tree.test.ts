import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import OrgMemberPickerTreePane from "@/components/org-member-picker/OrgMemberPickerTreePane.vue";
import { filterMemberOrgs } from "@/components/org-member-picker/org-member-picker-tree";
import type { OrgMemberPickerOrgNode } from "@/components/org-member-picker/org-member-picker-tree";

const orgs: OrgMemberPickerOrgNode[] = [
  {
    id: "s1",
    name: "阳光小学",
    people: [
      { id: "t1", name: "陈豪东", orgId: "s1", orgName: "阳光小学", meta: "语文", kind: "teacher", groupName: "语文组" },
      { id: "t2", name: "李明华", orgId: "s1", orgName: "阳光小学", meta: "数学", kind: "teacher", groupName: "数学组" },
    ],
    groups: [
      {
        name: "语文组",
        people: [
          { id: "t1", name: "陈豪东", orgId: "s1", orgName: "阳光小学", meta: "语文", kind: "teacher", groupName: "语文组" },
        ],
      },
      {
        name: "数学组",
        people: [
          { id: "t2", name: "李明华", orgId: "s1", orgName: "阳光小学", meta: "数学", kind: "teacher", groupName: "数学组" },
        ],
      },
    ],
  },
  {
    id: "s2",
    name: "育才中学",
    people: [
      { id: "t3", name: "周敏", orgId: "s2", orgName: "育才中学", meta: "英语", kind: "teacher", groupName: "英语组" },
    ],
    groups: [
      {
        name: "英语组",
        people: [
          { id: "t3", name: "周敏", orgId: "s2", orgName: "育才中学", meta: "英语", kind: "teacher", groupName: "英语组" },
        ],
      },
    ],
  },
];

describe("org member picker tree", () => {
  it("filters schools and groups by keyword", () => {
    expect(filterMemberOrgs(orgs, "阳光")).toHaveLength(1);
    expect(filterMemberOrgs(orgs, "英语组")[0]?.id).toBe("s2");
    expect(filterMemberOrgs(orgs, "不存在")).toEqual([]);
  });

  it("treats a school checkbox as select-all for that school", async () => {
    const wrapper = mount(OrgMemberPickerTreePane, {
      props: {
        orgs,
        selectedIds: [],
        expandedIds: ["s1"],
        activeKey: "org:s1",
      },
      global: { plugins: [ElementPlus] },
    });
    expect(wrapper.find(".pane-head .el-input").exists()).toBe(true);
    await wrapper.findAllComponents({ name: "ElCheckbox" })[0]?.vm.$emit("change", true);
    expect(wrapper.emitted("toggle-org")?.[0]).toEqual(["s1", true]);
  });
});

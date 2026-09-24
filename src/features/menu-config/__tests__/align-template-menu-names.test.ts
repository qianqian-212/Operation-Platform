import { describe, expect, it } from "vitest";
import { cloneTenantTemplate } from "@/config/menu-templates";
import {
  alignTemplateMenuNames,
  menuRecordsDiffer,
  normalizeLoadedMenuRecords,
} from "@/features/menu-config/align-template-menu-names";
import type { TenantInfo } from "@/types/user";

const bureau: TenantInfo = {
  id: "bureau-menu-rename",
  name: "演示教育局",
  shortName: "演示教育局",
  type: "bureau",
  enabled: true,
};

describe("alignTemplateMenuNames", () => {
  it("renames the stored cross-school activity page without touching customized labels", () => {
    const records = cloneTenantTemplate(bureau).map((record) =>
      record.pageKey === "bureau-cross-school-activity"
        ? { ...record, name: "跨校教研活动" }
        : record,
    );
    const customized = records.map((record) =>
      record.pageKey === "bureau-cross-school-activity"
        ? { ...record, name: "校本活动" }
        : record,
    );

    const aligned = alignTemplateMenuNames(records);
    const activity = aligned.find((record) => record.pageKey === "bureau-cross-school-activity");

    expect(activity?.name).toBe("活动管理");
    expect(alignTemplateMenuNames(customized)).toEqual(customized);
    expect(menuRecordsDiffer(aligned, records)).toBe(true);
    expect(menuRecordsDiffer(aligned, aligned)).toBe(false);
  });

  it("renames school lesson prep and observation pages to management labels", () => {
    const school: TenantInfo = {
      id: "school-menu-rename",
      name: "演示学校",
      shortName: "演示学校",
      type: "school",
      enabled: true,
    };
    const stored = cloneTenantTemplate(school).map((record) => {
      if (record.pageKey === "school-collective-lesson-prep") {
        return { ...record, name: "集体备课" };
      }
      if (record.pageKey === "school-lesson-observation") {
        return { ...record, name: "听评课" };
      }
      return record;
    });

    const aligned = normalizeLoadedMenuRecords(school, stored);
    expect(
      aligned.find((record) => record.pageKey === "school-collective-lesson-prep")?.name,
    ).toBe("集体备课管理");
    expect(
      aligned.find((record) => record.pageKey === "school-lesson-observation")?.name,
    ).toBe("听评课管理");
  });
});

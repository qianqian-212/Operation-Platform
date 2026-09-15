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

  it("applies the rename when loading an already initialized bureau tenant", () => {
    const stored = cloneTenantTemplate(bureau).map((record) =>
      record.pageKey === "bureau-cross-school-activity"
        ? { ...record, name: "跨校教研活动" }
        : record,
    );

    expect(
      normalizeLoadedMenuRecords(bureau, stored).find(
        (record) => record.pageKey === "bureau-cross-school-activity",
      )?.name,
    ).toBe("活动管理");
  });
});

import { describe, expect, it } from "vitest";
import {
  workbenchHeaderActionLabel,
  workbenchHeaderActionNotice,
} from "@/features/workbench/workbench-header-action";
import {
  allianceListData,
  crossSchoolActivitiesData,
  effectEvaluationData,
} from "@/features/workbench/workbench-alliance-panels-data";

describe("workbench header action", () => {
  it("reads action labels from alliance panel datasets", () => {
    expect(workbenchHeaderActionLabel(allianceListData())).toBe("查看全部");
    expect(workbenchHeaderActionLabel(effectEvaluationData())).toBe("查看详情");
    expect(workbenchHeaderActionLabel(crossSchoolActivitiesData())).toBe("查看全部");
    expect(workbenchHeaderActionLabel(null)).toBeNull();
  });

  it("maps widget kinds to pending-page notices", () => {
    expect(workbenchHeaderActionNotice("alliance-list")).toContain("教研联盟");
    expect(workbenchHeaderActionNotice("effect-evaluation")).toContain("效果评估");
    expect(workbenchHeaderActionNotice("cross-school-activities")).toContain("跨校活动");
  });
});

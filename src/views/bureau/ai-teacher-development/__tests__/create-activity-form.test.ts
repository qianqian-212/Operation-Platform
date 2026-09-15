import { describe, expect, it } from "vitest";
import {
  applyTeacherCheck,
  applyTeacherRole,
  defaultTaskAssignees,
} from "@/views/bureau/ai-teacher-development/create-activity-form";

describe("create activity task teacher selection", () => {
  it("defaults to 参与 when checking a teacher", () => {
    const selected = applyTeacherCheck(new Map(), "t1", true);
    expect(selected.get("t1")).toBe("participant");
  });

  it("auto-selects the teacher when choosing 主备 or 审阅", () => {
    const withLead = applyTeacherRole(new Map(), "t2", "lead");
    expect(withLead.get("t2")).toBe("lead");
    const withReviewer = applyTeacherRole(new Map(), "t3", "reviewer");
    expect(withReviewer.get("t3")).toBe("reviewer");
  });

  it("keeps an existing role when the teacher is re-checked", () => {
    const selected = applyTeacherCheck(new Map([["t1", "lead"]]), "t1", true);
    expect(selected.get("t1")).toBe("lead");
  });

  it("preselects all activity teachers as 参与 when a task has no assignees yet", () => {
    const selected = defaultTaskAssignees(
      [
        { id: "t1", name: "陈晓晓", schoolName: "阳光小学", subject: "语文" },
        { id: "t2", name: "李四", schoolName: "文德小学", subject: "数学" },
      ],
      [],
    );
    expect(selected.get("t1")).toBe("participant");
    expect(selected.get("t2")).toBe("participant");
  });
});

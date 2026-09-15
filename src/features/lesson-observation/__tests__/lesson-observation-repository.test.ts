import { describe, expect, it } from "vitest";
import { lessonObservationRepository } from "@/features/lesson-observation/lesson-observation-repository";
import { resetLessonObservationMockData } from "@/features/lesson-observation/mock-data";
import {
  defaultLessonObservationFilter,
  evaluationCategorySpans,
} from "@/features/lesson-observation/types";

describe("lesson observation repository", () => {
  it("returns screenshot seed rows and first-course detail", async () => {
    resetLessonObservationMockData();
    const page = await lessonObservationRepository.list(
      "bureau-001",
      defaultLessonObservationFilter(),
      1,
      10,
    );
    expect(page.total).toBe(10);
    expect(page.list.map((row) => row.courseName)).toEqual([
      "卖火柴的小女孩",
      "圆的认识",
      "数学广角",
      "宝葫芦的秘密",
      "塞下曲",
      "乡下孩子",
      "小红帽与大灰狼",
      "三角形的认识",
      "分数的初步认识",
      "射线、直线和线段",
    ]);
    expect(page.list[0]).toMatchObject({
      instructorName: "钱佳益",
      schoolName: "阳光小学",
      lessonDate: "2023-06-05",
      period: "第二节",
      gradeSubject: "一年级/语文",
      reviewMethod: "线下评课",
      assessmentTemplate: "教师通用评价表",
      score: 94,
    });

    const detail = await lessonObservationRepository.detail("bureau-001", "obs-matchgirl");
    expect(detail).toMatchObject({
      courseName: "卖火柴的小女孩",
      allianceName: "城东学区教研联盟",
      score: 94,
      reviewedCount: 3,
      totalScore: 100,
    });
    expect(detail?.reviewers.map((item) => item.name)).toEqual([
      "张小小",
      "陈果果",
      "李木木",
      "罗小言",
      "何天天",
    ]);
    expect(detail?.evaluations[0]).toMatchObject({
      category: "教学内容",
      score: 9,
    });
    expect(detail?.archives.map((item) => item.title)).toEqual([
      "测试听课-评课明细报告.pdf",
      "测试听课-评课汇总报告.pdf",
      "测试听课-课程资料.zip",
    ]);
  });

  it("filters by teacher, school, method and lesson date", async () => {
    resetLessonObservationMockData();
    const byTeacher = await lessonObservationRepository.list(
      "bureau-001",
      { ...defaultLessonObservationFilter(), teacherName: "钱佳" },
      1,
      10,
    );
    expect(byTeacher.total).toBe(1);
    expect(byTeacher.list[0]?.courseName).toBe("卖火柴的小女孩");

    const bySchool = await lessonObservationRepository.list(
      "bureau-001",
      { ...defaultLessonObservationFilter(), schoolId: "school-ocean" },
      1,
      10,
    );
    expect(bySchool.list.map((row) => row.courseName)).toEqual(["塞下曲"]);

    const live = await lessonObservationRepository.list(
      "bureau-001",
      { ...defaultLessonObservationFilter(), reviewMethod: "直播评课" },
      1,
      10,
    );
    expect(live.list[0]?.courseName).toBe("圆的认识");

    const ranged = await lessonObservationRepository.list(
      "bureau-001",
      { ...defaultLessonObservationFilter(), startDate: "2023-06-14", endDate: "2023-06-16" },
      1,
      10,
    );
    expect(ranged.list.map((row) => row.courseName)).toEqual([
      "三角形的认识",
      "分数的初步认识",
      "射线、直线和线段",
    ]);
  });

  it("merges consecutive evaluation categories for the report table", () => {
    expect(
      evaluationCategorySpans([
        { id: "a", category: "教学内容", standard: "x", score: 9 },
        { id: "b", category: "教学效果", standard: "y", score: 10 },
        { id: "c", category: "教学效果", standard: "z", score: 10 },
      ]),
    ).toEqual([1, 2, 0]);
  });
});

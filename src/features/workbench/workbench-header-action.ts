import type { WorkbenchWidgetData, WorkbenchWidgetKind } from "@/features/workbench/types";

const HEADER_ACTION_NOTICE = {
  "alliance-list": "教研联盟列表页即将开放",
  "effect-evaluation": "效果评估详情页即将开放",
  "cross-school-activities": "跨校活动列表页即将开放",
} as const;

export function workbenchHeaderActionLabel(data: WorkbenchWidgetData | null) {
  if (!data) return null;
  switch (data.kind) {
    case "alliance-list":
    case "effect-evaluation":
    case "cross-school-activities":
      return data.actionLabel;
    default:
      return null;
  }
}

export function workbenchHeaderActionNotice(kind: WorkbenchWidgetKind | string) {
  if (kind === "alliance-list" || kind === "effect-evaluation" || kind === "cross-school-activities") {
    return HEADER_ACTION_NOTICE[kind];
  }
  return "相关页面即将开放";
}

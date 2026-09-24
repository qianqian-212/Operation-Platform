import type { WorkbenchWidgetData, WorkbenchWidgetKind } from "@/features/workbench/types";

const HEADER_ACTION_NOTICE = {
  "alliance-list": "教研联盟列表页即将开放",
  "cross-school-activities": "跨校活动列表页即将开放",
} as const;

const HEADER_ACTION_PATH: Partial<Record<WorkbenchWidgetKind, string>> = {
  "effect-evaluation": "/bureau/ai-teacher-development/cross-school-research/effect-evaluation",
};

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

export function workbenchHeaderActionPath(kind: WorkbenchWidgetKind | string) {
  if (kind in HEADER_ACTION_PATH) {
    return HEADER_ACTION_PATH[kind as WorkbenchWidgetKind] ?? null;
  }
  return null;
}

export function workbenchHeaderActionNotice(kind: WorkbenchWidgetKind | string) {
  if (kind === "alliance-list" || kind === "cross-school-activities") {
    return HEADER_ACTION_NOTICE[kind];
  }
  if (kind === "effect-evaluation") return null;
  return "相关页面即将开放";
}

import type { WorkbenchWidgetTone } from "@/features/workbench/types";

const TAG_TYPE = {
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
  neutral: "info",
} as const;

const FALLBACK_LABEL = {
  primary: "通知",
  success: "正常",
  warning: "提醒",
  danger: "告警",
  neutral: "事项",
} as const;

export function workbenchTagType(tone?: WorkbenchWidgetTone) {
  return TAG_TYPE[tone ?? "neutral"];
}

export function workbenchItemLabel(item: { label?: string; tone?: WorkbenchWidgetTone }) {
  return item.label || FALLBACK_LABEL[item.tone ?? "neutral"];
}

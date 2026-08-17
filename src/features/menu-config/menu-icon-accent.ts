export const MENU_ICON_ACCENTS = ["blue", "red", "yellow", "cyan", "green"] as const;

export type MenuIconAccent = (typeof MENU_ICON_ACCENTS)[number];

export const MENU_ICON_ACCENT_OPTIONS: readonly { value: MenuIconAccent; label: string }[] = [
  { value: "blue", label: "蓝色" },
  { value: "red", label: "红色" },
  { value: "yellow", label: "黄色" },
  { value: "cyan", label: "青色" },
  { value: "green", label: "绿色" },
];

const RED_HINT = /安全|告警|预警|门禁|异常|shield|alert|siren|ban/i;
const YELLOW_HINT = /缴费|财务|结算|收费|退费|money|coin|wallet|bank/i;
const GREEN_HINT = /体育|操场|成长|健康|运动|sports|heart|activity/i;
const CYAN_HINT = /课后|托管|通知|公告|消息|服务|chat|bell|calendar|message/i;

export function isMenuIconAccent(value: unknown): value is MenuIconAccent {
  return typeof value === "string"
    && (MENU_ICON_ACCENTS as readonly string[]).includes(value);
}

export function resolveMenuIconAccent(input: {
  accent?: MenuIconAccent | null;
  icon?: string | null;
  name?: string;
  moduleName?: string;
}): MenuIconAccent {
  if (isMenuIconAccent(input.accent)) return input.accent;
  const haystack = [input.name, input.moduleName, input.icon].filter(Boolean).join(" ");
  if (RED_HINT.test(haystack)) return "red";
  if (YELLOW_HINT.test(haystack)) return "yellow";
  if (GREEN_HINT.test(haystack)) return "green";
  if (CYAN_HINT.test(haystack)) return "cyan";
  return "blue";
}

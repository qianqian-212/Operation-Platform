const READ_STORAGE_KEY = "operation-platform:message-center-read:v1";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function loadMessageCenterReadIds(contextKey: string): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return new Set();
    const ids = (parsed as Record<string, unknown>)[contextKey];
    return isStringArray(ids) ? new Set(ids) : new Set();
  } catch {
    return new Set();
  }
}

export function saveMessageCenterReadIds(contextKey: string, readItemIds: ReadonlySet<string>) {
  if (typeof localStorage === "undefined") return;
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as unknown : {};
    const next = parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? { ...(parsed as Record<string, unknown>) }
      : {};
    next[contextKey] = [...readItemIds];
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private-mode failures; in-memory state still works for the session.
  }
}

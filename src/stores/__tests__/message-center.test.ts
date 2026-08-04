import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useMessageCenterStore } from "@/stores/message-center";

const context = { tenantId: "bureau-a", userId: "user-a", tenantType: "bureau" as const };

describe("message center store", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("loads public feed items and keeps read state within the active identity", () => {
    const store = useMessageCenterStore();

    store.open(context);
    expect(store.isOpen).toBe(true);
    expect(store.unreadCount).toBe(3);

    store.markRead(context, "announcements:announcement-1");
    expect(store.unreadCount).toBe(2);

    store.refresh({ ...context, userId: "user-b" });
    expect(store.unreadCount).toBe(3);
  });
});

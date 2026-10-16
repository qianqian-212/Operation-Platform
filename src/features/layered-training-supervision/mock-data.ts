import {
  cloneSupervisionStandard,
  DEFAULT_SUPERVISION_STANDARD,
  type SupervisionStandard,
} from "@/features/layered-training-supervision/types";

let store = new Map<string, SupervisionStandard>();

export function resetSupervisionStandardMockData() {
  store = new Map();
}

export function getSupervisionStandardMock(tenantId: string) {
  const found = store.get(tenantId) ?? DEFAULT_SUPERVISION_STANDARD;
  return cloneSupervisionStandard(found);
}

export function saveSupervisionStandardMock(tenantId: string, standard: SupervisionStandard) {
  const next = cloneSupervisionStandard(standard);
  store.set(tenantId, next);
  return cloneSupervisionStandard(next);
}

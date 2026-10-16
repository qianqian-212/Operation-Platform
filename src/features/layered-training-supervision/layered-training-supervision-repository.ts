import {
  getSupervisionStandardMock,
  saveSupervisionStandardMock,
} from "@/features/layered-training-supervision/mock-data";
import {
  NOTICE_CYCLE_DAY_LIMITS,
  SEMESTER_CREDIT_LIMITS,
  SLOW_PROGRESS_DAY_LIMITS,
  WARNING_PERCENT_LIMITS,
  type SupervisionStandard,
} from "@/features/layered-training-supervision/types";

export interface LayeredTrainingSupervisionRepository {
  load(tenantId: string): Promise<SupervisionStandard>;
  save(tenantId: string, standard: SupervisionStandard): Promise<SupervisionStandard>;
}

function assertIntegerInRange(value: number, min: number, max: number, message: string) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(message);
  }
}

function validateStandard(standard: SupervisionStandard) {
  assertIntegerInRange(
    standard.slowProgressDays,
    SLOW_PROGRESS_DAY_LIMITS.min,
    SLOW_PROGRESS_DAY_LIMITS.max,
    `进度缓慢判定天数需在 ${SLOW_PROGRESS_DAY_LIMITS.min}-${SLOW_PROGRESS_DAY_LIMITS.max} 之间`,
  );
  assertIntegerInRange(
    standard.noticeCycleDays,
    NOTICE_CYCLE_DAY_LIMITS.min,
    NOTICE_CYCLE_DAY_LIMITS.max,
    `通知周期需在 ${NOTICE_CYCLE_DAY_LIMITS.min}-${NOTICE_CYCLE_DAY_LIMITS.max} 之间`,
  );
  assertIntegerInRange(
    standard.semesterCreditLine,
    SEMESTER_CREDIT_LIMITS.min,
    SEMESTER_CREDIT_LIMITS.max,
    `学期达标线需在 ${SEMESTER_CREDIT_LIMITS.min}-${SEMESTER_CREDIT_LIMITS.max} 之间`,
  );
  assertIntegerInRange(
    standard.warningTriggerPercent,
    WARNING_PERCENT_LIMITS.min,
    WARNING_PERCENT_LIMITS.max,
    `达标预警触发比例需在 ${WARNING_PERCENT_LIMITS.min}-${WARNING_PERCENT_LIMITS.max} 之间`,
  );
}

const localRepository: LayeredTrainingSupervisionRepository = {
  async load(tenantId) {
    return getSupervisionStandardMock(tenantId);
  },

  async save(tenantId, standard) {
    validateStandard(standard);
    return saveSupervisionStandardMock(tenantId, standard);
  },
};

export const layeredTrainingSupervisionRepository: LayeredTrainingSupervisionRepository =
  localRepository;

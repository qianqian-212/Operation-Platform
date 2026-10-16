/** 教育局 AI 分层研修督学标准 */
export interface SupervisionStandard {
  /** 连续未更新进度达到该天数后判定为进度缓慢 */
  slowProgressDays: number;
  /** 首次通知后的复查周期天数 */
  noticeCycleDays: number;
  /** 教师本学期需获得的最低学分 */
  semesterCreditLine: number;
  /** 完成率低于该百分比时触发达标预警 */
  warningTriggerPercent: number;
}

export const SLOW_PROGRESS_DAY_LIMITS = { min: 1, max: 30 } as const;
export const NOTICE_CYCLE_DAY_LIMITS = { min: 1, max: 30 } as const;
export const SEMESTER_CREDIT_LIMITS = { min: 1, max: 200 } as const;
export const WARNING_PERCENT_LIMITS = { min: 0, max: 100 } as const;

export const DEFAULT_SUPERVISION_STANDARD: SupervisionStandard = {
  slowProgressDays: 14,
  noticeCycleDays: 14,
  semesterCreditLine: 12,
  warningTriggerPercent: 60,
};

export const SUPERVISION_REMINDER_NOTE =
  "提醒方式说明：老师进入系统界面时，工作台将显示进度缓慢提示横幅，老师可手动关闭横幅，但下次进入系统若仍存在该情况，则继续提示。系统不记录已读/未读状态。";

export function cloneSupervisionStandard(standard: SupervisionStandard): SupervisionStandard {
  return { ...standard };
}

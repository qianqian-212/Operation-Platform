import {
  createEmptyObservation,
  OBSERVATION_PERIOD_OPTIONS,
  OBSERVATION_SUBJECT_GRADE_OPTIONS,
  type ActivityCourseMaterial,
  type ActivityObservation,
} from "@/features/cross-school-activity/types";

const SUBJECT_GRADE_SET = new Set<string>(OBSERVATION_SUBJECT_GRADE_OPTIONS);
const PERIOD_SET = new Set<string>(OBSERVATION_PERIOD_OPTIONS);

export function subjectGradeOptions(current: string) {
  if (current && !SUBJECT_GRADE_SET.has(current)) return [current, ...OBSERVATION_SUBJECT_GRADE_OPTIONS];
  return [...OBSERVATION_SUBJECT_GRADE_OPTIONS];
}

export function periodOptions(current: string) {
  if (current && !PERIOD_SET.has(current)) return [current, ...OBSERVATION_PERIOD_OPTIONS];
  return [...OBSERVATION_PERIOD_OPTIONS];
}

export type ObservationPickerRole = "instructor" | "reviewer";

export interface ObservationFormState {
  courseName: string;
  instructorId: string;
  instructorName: string;
  scheduledDate: string;
  scheduledPeriod: string;
  subjectGrade: string;
  assessmentTemplate: string;
  materials: ActivityCourseMaterial[];
  reviewerId: string;
  reviewerName: string;
  reviewMethod: string;
}

const MATERIAL_MAX_BYTES = 20 * 1024 * 1024;
export const MATERIAL_MAX_COUNT = 5;
export const MATERIAL_ACCEPT = ".doc,.docx,.ppt,.pptx,.pdf";

export function splitScheduledAt(value: string) {
  const [date = "", time = ""] = value.trim().split(" ");
  return { date, time };
}

export function joinScheduledAt(date: string, period: string) {
  return [date.trim(), period.trim()].filter(Boolean).join(" ");
}

export function toSubjectGrade(subject: string, grade: string) {
  if (subject && grade) return `${subject}/${grade}`;
  return subject || grade;
}

export function fromSubjectGrade(value: string) {
  const [subject = "", grade = ""] = value.split("/");
  return { subject, grade };
}

export function emptyObservationForm(): ObservationFormState {
  return {
    courseName: "",
    instructorId: "",
    instructorName: "",
    scheduledDate: "",
    scheduledPeriod: "",
    subjectGrade: "",
    assessmentTemplate: "",
    materials: [],
    reviewerId: "",
    reviewerName: "",
    reviewMethod: "",
  };
}

export function observationToForm(observation: ActivityObservation | null): ObservationFormState {
  if (!observation) return emptyObservationForm();
  const scheduled = splitScheduledAt(observation.scheduledAt);
  return {
    courseName: observation.courseName,
    instructorId: observation.instructorId,
    instructorName: observation.instructorName,
    scheduledDate: scheduled.date,
    scheduledPeriod: scheduled.time,
    subjectGrade: toSubjectGrade(observation.subject, observation.grade),
    assessmentTemplate: observation.assessmentTemplate,
    materials: observation.materials.map((item) => ({ ...item })),
    reviewerId: observation.reviewerId,
    reviewerName: observation.reviewerName,
    reviewMethod: observation.reviewMethod,
  };
}

export function formToObservation(
  form: ObservationFormState,
  current: ActivityObservation | null,
): ActivityObservation {
  const { subject, grade } = fromSubjectGrade(form.subjectGrade);
  return {
    ...createEmptyObservation(),
    ...current,
    courseName: form.courseName.trim(),
    instructorId: form.instructorId,
    instructorName: form.instructorName,
    scheduledAt: joinScheduledAt(form.scheduledDate, form.scheduledPeriod),
    subject,
    grade,
    reviewerId: form.reviewerId,
    reviewerName: form.reviewerName,
    reviewMethod: form.reviewMethod,
    assessmentTemplate: form.assessmentTemplate,
    materials: form.materials.map((item) => ({ ...item })),
  };
}

export function validateObservationForm(form: ObservationFormState) {
  if (!form.courseName.trim()) return "请填写课程名称";
  if (!form.instructorId) return "请选择授课老师";
  if (!form.scheduledDate || !form.scheduledPeriod) return "请选择授课时间";
  if (!form.subjectGrade) return "请选择学科/年级";
  if (!form.assessmentTemplate) return "请选择考核模板";
  if (!form.materials.length) return "请上传课程资料";
  if (!form.reviewerId) return "请选择评课老师";
  if (!form.reviewMethod) return "请选择评课方式";
  return null;
}

export function formatMaterialSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(3).replace(/\.?0+$/, "")}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function validateMaterialFile(file: File, currentCount: number) {
  if (currentCount >= MATERIAL_MAX_COUNT) return "最多上传 5 个文件";
  if (file.size > MATERIAL_MAX_BYTES) return "单个文件需不超过 20MB";
  const name = file.name.toLowerCase();
  const allowed = [".doc", ".docx", ".ppt", ".pptx", ".pdf"];
  if (!allowed.some((ext) => name.endsWith(ext))) return "仅支持 doc、docx、ppt、pptx、pdf";
  return null;
}

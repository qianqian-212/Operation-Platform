import {
  type ActivityLessonTopic,
  type ActivityTaskAssignee,
  type ActivityTaskInput,
  type ActivityTaskRole,
  type CrossSchoolActivityType,
} from "@/features/cross-school-activity/types";
import type { ObservationFormState } from "@/views/bureau/ai-teacher-development/observation-form";
import { emptyObservationForm } from "@/views/bureau/ai-teacher-development/observation-form";

export interface ActivityTaskTeacherOption {
  id: string;
  name: string;
  schoolName: string;
  subject: string;
}

export interface CreateActivityFormState {
  name: string;
  types: CrossSchoolActivityType[];
  allianceId: string;
  scheduledAt: string;
  location: string;
  description: string;
  leadSchoolId: string;
  memberSchoolIds: string[];
  teacherIds: string[];
  topic: ActivityLessonTopic;
  tasks: ActivityTaskInput[];
  observation: ObservationFormState;
}

export function emptyLessonTopic(): ActivityLessonTopic {
  return {
    stage: "",
    subject: "",
    grade: "",
    title: "",
    period: "",
    textbookVersion: "",
    chapter: "",
  };
}

export function emptyObservation(): ObservationFormState {
  return emptyObservationForm();
}

export function systemTask(id: string, name: string): ActivityTaskInput {
  return {
    id,
    name,
    source: "system",
    requireFile: true,
    assignees: [],
    note: "",
  };
}

export function emptyCustomTask(): ActivityTaskInput {
  return {
    id: `task-custom-${crypto.randomUUID()}`,
    name: "",
    source: "custom",
    requireFile: true,
    assignees: [],
    note: "",
  };
}

export function defaultActivityTasks(): ActivityTaskInput[] {
  return [systemTask("task-prep", "集体备课"), systemTask("task-observe", "听评课")];
}

export function assigneeMap(assignees: readonly ActivityTaskAssignee[]) {
  return new Map(assignees.map((item) => [item.teacherId, item.role]));
}

export function toAssignees(selected: ReadonlyMap<string, ActivityTaskRole>): ActivityTaskAssignee[] {
  return Array.from(selected.entries()).map(([teacherId, role]) => ({ teacherId, role }));
}

export function applyTeacherCheck(
  selected: ReadonlyMap<string, ActivityTaskRole>,
  id: string,
  checked: boolean,
) {
  const next = new Map(selected);
  if (checked) next.set(id, next.get(id) ?? "participant");
  else next.delete(id);
  return next;
}

export function applyTeacherRole(
  selected: ReadonlyMap<string, ActivityTaskRole>,
  id: string,
  value: string,
) {
  if (value !== "participant" && value !== "lead" && value !== "reviewer") return new Map(selected);
  const next = new Map(selected);
  next.set(id, value);
  return next;
}

export function defaultTaskAssignees(
  teachers: readonly ActivityTaskTeacherOption[],
  assignees: readonly ActivityTaskAssignee[],
) {
  if (assignees.length) return assigneeMap(assignees);
  return new Map(teachers.map((item) => [item.id, "participant" as const]));
}

export function hasActivityType(
  types: readonly CrossSchoolActivityType[],
  type: CrossSchoolActivityType,
) {
  return types.includes(type);
}

export function primaryActivityType(types: readonly CrossSchoolActivityType[]): CrossSchoolActivityType {
  return types[0] ?? "lesson-prep";
}

export function createEmptyActivityForm(): CreateActivityFormState {
  return {
    name: "",
    types: ["lesson-prep"],
    allianceId: "",
    scheduledAt: "",
    location: "",
    description: "",
    leadSchoolId: "",
    memberSchoolIds: [],
    teacherIds: [],
    topic: emptyLessonTopic(),
    tasks: defaultActivityTasks(),
    observation: emptyObservation(),
  };
}

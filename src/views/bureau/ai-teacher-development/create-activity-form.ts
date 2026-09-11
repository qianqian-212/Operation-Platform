import type {
  ActivityLessonTopic,
  ActivityObservation,
  ActivityTaskInput,
  CrossSchoolActivityType,
} from "@/features/cross-school-activity/types";

export interface CreateActivityFormState {
  name: string;
  type: CrossSchoolActivityType;
  allianceId: string;
  scheduledAt: string;
  location: string;
  description: string;
  leadSchoolId: string;
  memberSchoolIds: string[];
  teacherIds: string[];
  topic: ActivityLessonTopic;
  tasks: ActivityTaskInput[];
  observation: ActivityObservation;
}

export function emptyLessonTopic(): ActivityLessonTopic {
  return {
    stage: "小学",
    subject: "语文",
    grade: "三年级",
    title: "",
    period: "",
  };
}

export function emptyObservation(): ActivityObservation {
  return {
    courseName: "",
    instructorName: "",
    scheduledAt: "",
    method: "线下听课",
    grade: "三年级",
    subject: "语文",
    courseType: "新授课",
    reviewerName: "",
    reviewMethod: "量表评课",
  };
}

export function emptyTask(): ActivityTaskInput {
  return { name: "", ownerId: "", resourceLabel: "" };
}

export function createEmptyActivityForm(): CreateActivityFormState {
  return {
    name: "",
    type: "lesson-prep",
    allianceId: "",
    scheduledAt: "",
    location: "",
    description: "",
    leadSchoolId: "",
    memberSchoolIds: [],
    teacherIds: [],
    topic: emptyLessonTopic(),
    tasks: [emptyTask()],
    observation: emptyObservation(),
  };
}

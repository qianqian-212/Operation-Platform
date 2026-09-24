import type {
  AllianceOption,
  CrossSchoolTeamDetail,
  CrossSchoolTeamRow,
} from "@/features/cross-school-team/types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

const ALLIANCES: AllianceOption[] = [
  { id: "alliance-east", name: "城东学区教研联盟" },
  { id: "alliance-west", name: "城西学区教研联盟" },
];

const TEAM_NAME = "小学语文跨校教研团队";

function baseRow(id: string, allianceId: string, allianceName: string): CrossSchoolTeamRow {
  return {
    id,
    name: TEAM_NAME,
    allianceId,
    allianceName,
    subject: "语文",
    leadTeacherName: "张晓晓",
    leadSchoolName: "阳光小学",
    memberCount: 6,
    status: "active",
  };
}

const ROWS: CrossSchoolTeamRow[] = Array.from({ length: 12 }, (_, index) => {
  const alliance = ALLIANCES[index % ALLIANCES.length]!;
  return baseRow(`team-${index + 1}`, alliance.id, alliance.name);
});

const DETAIL: CrossSchoolTeamDetail = {
  ...ROWS[0]!,
  id: "team-1",
  leadTeacherName: "李明华",
  leadSchoolName: "阳光小学",
  description: "本团队聚焦小学语文阅读与习作教学，开展跨校集体备课与听评课研讨。",
  members: [
    {
      id: "m1",
      name: "李明华",
      schoolName: "阳光小学",
      subject: "语文",
      title: "高级教师",
      role: "lead",
    },
    {
      id: "m2",
      name: "王芳",
      schoolName: "文德小学",
      subject: "语文",
      title: "一级教师",
      role: "member",
    },
    {
      id: "m3",
      name: "陈豪东",
      schoolName: "实验学校",
      subject: "语文",
      title: "一级教师",
      role: "member",
    },
    {
      id: "m4",
      name: "张晓晓",
      schoolName: "阳光小学",
      subject: "语文",
      title: "二级教师",
      role: "member",
    },
  ],
  activities: [
    {
      id: "activity-chinese",
      name: "跨校集体备课·小学语文三年级《富饶的西沙群岛》",
      typeLabel: "集体备课",
      scheduledAt: "2026-08-25 14:00",
      leadSchoolName: "阳光小学",
      status: "ongoing",
    },
    {
      id: "activity-english",
      name: "跨校集体备课·小学英语阅读教学",
      typeLabel: "集体备课",
      scheduledAt: "2026-08-20 14:00",
      leadSchoolName: "实验学校",
      status: "archived",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "《富饶的西沙群岛》跨校集体备课教案集",
      publishedAt: "2026-08-25",
      shareCount: 36,
    },
    {
      id: "ach-2",
      title: "小学语文跨校听评课案例汇编",
      publishedAt: "2026-07-18",
      shareCount: 22,
    },
    {
      id: "ach-3",
      title: "三年级阅读教学研讨课件",
      publishedAt: "2026-06-12",
      shareCount: 18,
    },
  ],
};

export function listCrossSchoolTeamAlliances() {
  return clone(ALLIANCES);
}

export function listCrossSchoolTeamRows() {
  return clone(ROWS);
}

export function getCrossSchoolTeamDetail(id: string) {
  if (id === DETAIL.id) return clone(DETAIL);
  const row = ROWS.find((item) => item.id === id);
  if (!row) return null;
  return clone({
    ...DETAIL,
    ...row,
    members: DETAIL.members.map((member, index) => ({
      ...member,
      id: `${row.id}-m${index + 1}`,
    })),
  });
}

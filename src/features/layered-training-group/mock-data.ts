import type {
  LayeredTrainingGroupImportRecord,
  LayeredTrainingGroupImportSheet,
  LayeredTrainingGroupMember,
  LayeredTrainingGroupMemberDraft,
} from "@/features/layered-training-group/types";

interface StoredGroup {
  id: string;
  name: string;
}

interface TenantGroups {
  groups: StoredGroup[];
  members: LayeredTrainingGroupMember[];
  imports: LayeredTrainingGroupImportRecord[];
  sequence: number;
}

const PRIMARY_MEMBERS: LayeredTrainingGroupMemberDraft[] = [
  { schoolName: "阳光小学", teacherName: "张晓晓", phone: "13800000000" },
  { schoolName: "阳光小学", teacherName: "李芳", phone: "13800000001" },
  { schoolName: "育才小学", teacherName: "王刚", phone: "13800000002" },
  { schoolName: "第一小学", teacherName: "陈红", phone: "13800000003" },
  { schoolName: "第二小学", teacherName: "刘伟", phone: "13800000004" },
  { schoolName: "第三小学", teacherName: "赵敏", phone: "13800000005" },
  { schoolName: "实验小学", teacherName: "周强", phone: "13800000006" },
  { schoolName: "中心小学", teacherName: "吴丽", phone: "13800000007" },
  { schoolName: "外国语小学", teacherName: "郑明", phone: "13800000008" },
  { schoolName: "阳光小学", teacherName: "孙悦", phone: "13800000009" },
  { schoolName: "育才小学", teacherName: "钱程", phone: "13800000010" },
  { schoolName: "第一小学", teacherName: "冯雪", phone: "13800000011" },
];

const EXTRA_GROUPS: Array<{ name: string; members: LayeredTrainingGroupMemberDraft[] }> = [
  {
    name: "骨干研修组",
    members: [
      { schoolName: "第二小学", teacherName: "李芳", phone: "13800000021" },
      { schoolName: "实验小学", teacherName: "周强", phone: "13800000022" },
    ],
  },
  {
    name: "青年教师组",
    members: [{ schoolName: "第三小学", teacherName: "赵敏", phone: "13800000031" }],
  },
  {
    name: "学科带头人组",
    members: [{ schoolName: "中心小学", teacherName: "吴丽", phone: "13800000041" }],
  },
];

let tenants = new Map<string, TenantGroups>();

export function resetLayeredTrainingGroupMockData() {
  tenants = new Map();
}

function nextId(state: TenantGroups, prefix: string) {
  state.sequence += 1;
  return `${prefix}-${state.sequence}`;
}

function cloneMember(member: LayeredTrainingGroupMember): LayeredTrainingGroupMember {
  return { ...member };
}

function seedMembers(state: TenantGroups, groupId: string, drafts: readonly LayeredTrainingGroupMemberDraft[]) {
  for (const draft of drafts) {
    state.members.push({ id: nextId(state, "ltg-m"), groupId, ...draft });
  }
}

function createTenant(): TenantGroups {
  const state: TenantGroups = { groups: [], members: [], imports: [], sequence: 0 };
  const primaryId = nextId(state, "ltg");
  state.groups.push({ id: primaryId, name: "新教师培养组" });
  seedMembers(state, primaryId, PRIMARY_MEMBERS);
  for (const extra of EXTRA_GROUPS) {
    const groupId = nextId(state, "ltg");
    state.groups.push({ id: groupId, name: extra.name });
    seedMembers(state, groupId, extra.members);
  }
  return state;
}

function tenantState(tenantId: string) {
  const found = tenants.get(tenantId);
  if (found) return found;
  const created = createTenant();
  tenants.set(tenantId, created);
  return created;
}

export function listStoredGroups(tenantId: string) {
  return tenantState(tenantId).groups.map((group) => ({ ...group }));
}

export function listStoredMembers(tenantId: string, groupId: string) {
  return tenantState(tenantId)
    .members.filter((member) => member.groupId === groupId)
    .map(cloneMember);
}

export function listStoredImports(tenantId: string) {
  return tenantState(tenantId).imports.map((record) => ({ ...record }));
}

export function insertStoredGroup(tenantId: string, name: string) {
  const state = tenantState(tenantId);
  const group = { id: nextId(state, "ltg"), name };
  state.groups.push(group);
  return { ...group };
}

export function deleteStoredGroup(tenantId: string, groupId: string) {
  const state = tenantState(tenantId);
  const group = state.groups.find((item) => item.id === groupId);
  if (!group) throw new Error("分组不存在");
  state.groups = state.groups.filter((item) => item.id !== groupId);
  state.members = state.members.filter((member) => member.groupId !== groupId);
}

export function insertStoredMember(tenantId: string, groupId: string, draft: LayeredTrainingGroupMemberDraft) {
  const state = tenantState(tenantId);
  if (!state.groups.some((group) => group.id === groupId)) throw new Error("分组不存在");
  const member = { id: nextId(state, "ltg-m"), groupId, ...draft };
  state.members.push(member);
  return cloneMember(member);
}

function groupIdByName(state: TenantGroups, name: string) {
  const found = state.groups.find((group) => group.name === name);
  if (found) return found.id;
  const created = { id: nextId(state, "ltg"), name };
  state.groups.push(created);
  return created.id;
}

function upsertMember(state: TenantGroups, groupId: string, draft: LayeredTrainingGroupMemberDraft) {
  const found = state.members.find((member) => member.groupId === groupId && member.phone === draft.phone);
  if (found) {
    found.schoolName = draft.schoolName;
    found.teacherName = draft.teacherName;
    return;
  }
  state.members.push({ id: nextId(state, "ltg-m"), groupId, ...draft });
}

export function applyStoredImport(
  tenantId: string,
  fileName: string,
  importedAt: string,
  sheets: readonly LayeredTrainingGroupImportSheet[],
) {
  const state = tenantState(tenantId);
  let memberCount = 0;
  for (const sheet of sheets) {
    const groupId = groupIdByName(state, sheet.groupName);
    for (const row of sheet.rows) {
      upsertMember(state, groupId, row);
      memberCount += 1;
    }
  }
  const record: LayeredTrainingGroupImportRecord = {
    id: nextId(state, "ltg-i"),
    fileName,
    importedAt,
    groupCount: sheets.length,
    memberCount,
  };
  state.imports.unshift(record);
  return { ...record };
}

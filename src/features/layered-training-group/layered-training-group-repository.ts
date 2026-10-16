import { listLayeredTrainingCourseGroupNames } from "@/features/layered-training-course-review/mock-data";
import {
  applyStoredImport,
  deleteStoredGroup,
  insertStoredGroup,
  insertStoredMember,
  listStoredGroups,
  listStoredImports,
  listStoredMembers,
} from "@/features/layered-training-group/mock-data";
import {
  GROUP_MEMBER_TEXT_MAX_LENGTH,
  GROUP_NAME_MAX_LENGTH,
  GROUP_PHONE_PATTERN,
  type LayeredTrainingGroup,
  type LayeredTrainingGroupImportPayload,
  type LayeredTrainingGroupImportSheet,
  type LayeredTrainingGroupMemberDraft,
  type LayeredTrainingGroupMemberQuery,
} from "@/features/layered-training-group/types";

export interface LayeredTrainingGroupRepository {
  listGroups(tenantId: string): Promise<LayeredTrainingGroup[]>;
  listMembers(tenantId: string, query: LayeredTrainingGroupMemberQuery): Promise<{
    rows: ReturnType<typeof listStoredMembers>;
    total: number;
  }>;
  listImports(tenantId: string): Promise<ReturnType<typeof listStoredImports>>;
  createGroup(tenantId: string, name: string): Promise<LayeredTrainingGroup>;
  removeGroup(tenantId: string, groupId: string): Promise<void>;
  addMember(
    tenantId: string,
    groupId: string,
    draft: LayeredTrainingGroupMemberDraft,
  ): Promise<void>;
  importMembers(tenantId: string, payload: LayeredTrainingGroupImportPayload): Promise<void>;
}

function linkedNames() {
  return new Set(listLayeredTrainingCourseGroupNames());
}

function withCourseLink(group: { id: string; name: string }, linked: Set<string>): LayeredTrainingGroup {
  return { ...group, courseLinked: linked.has(group.name) };
}

function assertGroupName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("请输入分组名称");
  if (trimmed.length > GROUP_NAME_MAX_LENGTH) {
    throw new Error(`分组名称不能超过 ${GROUP_NAME_MAX_LENGTH} 个字`);
  }
  return trimmed;
}

function assertMemberText(value: string, label: string, prefix: string) {
  const trimmed = value.trim();
  const where = prefix ? `${prefix}的` : "";
  if (!trimmed) throw new Error(`请输入${where}${label}`);
  if (trimmed.length > GROUP_MEMBER_TEXT_MAX_LENGTH) {
    throw new Error(`${where}${label}不能超过 ${GROUP_MEMBER_TEXT_MAX_LENGTH} 个字`);
  }
  return trimmed;
}

function normalizeMember(draft: LayeredTrainingGroupMemberDraft, sheetName = "") {
  const prefix = sheetName ? `工作表「${sheetName}」` : "";
  const schoolName = assertMemberText(draft.schoolName, "学校名称", prefix);
  const teacherName = assertMemberText(draft.teacherName, "老师姓名", prefix);
  const phone = draft.phone.trim();
  if (!GROUP_PHONE_PATTERN.test(phone)) {
    throw new Error(prefix ? `${prefix}请输入 11 位手机号码` : "请输入 11 位手机号码");
  }
  return { schoolName, teacherName, phone };
}

function assertUniquePhones(sheet: LayeredTrainingGroupImportSheet) {
  const seen = new Set<string>();
  for (const row of sheet.rows) {
    if (seen.has(row.phone)) {
      throw new Error(`工作表「${sheet.groupName}」中手机号码「${row.phone}」重复`);
    }
    seen.add(row.phone);
  }
}

function normalizeSheets(sheets: readonly LayeredTrainingGroupImportSheet[]) {
  if (sheets.length === 0) throw new Error("未找到工作表");
  const normalized = sheets.map((sheet) => ({
    groupName: assertGroupName(sheet.groupName),
    rows: sheet.rows.map((row) => normalizeMember(row, sheet.groupName.trim())),
  }));
  const names = new Set(normalized.map((sheet) => sheet.groupName));
  if (names.size !== normalized.length) throw new Error("工作表名称重复");
  for (const sheet of normalized) assertUniquePhones(sheet);
  return normalized;
}

function formatImportedAt(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${date.getFullYear()}-${month}-${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const localRepository: LayeredTrainingGroupRepository = {
  async listGroups(tenantId) {
    const linked = linkedNames();
    return listStoredGroups(tenantId).map((group) => withCourseLink(group, linked));
  },

  async listMembers(tenantId, query) {
    const members = query.groupId ? listStoredMembers(tenantId, query.groupId) : [];
    const start = Math.max(query.page - 1, 0) * query.pageSize;
    return { rows: members.slice(start, start + query.pageSize), total: members.length };
  },

  async listImports(tenantId) {
    return listStoredImports(tenantId);
  },

  async createGroup(tenantId, name) {
    const trimmed = assertGroupName(name);
    if (listStoredGroups(tenantId).some((group) => group.name === trimmed)) {
      throw new Error("分组名称已存在");
    }
    return withCourseLink(insertStoredGroup(tenantId, trimmed), linkedNames());
  },

  async removeGroup(tenantId, groupId) {
    const group = listStoredGroups(tenantId).find((item) => item.id === groupId);
    if (!group) throw new Error("分组不存在");
    if (linkedNames().has(group.name)) throw new Error("该分组已关联课程，无法删除");
    deleteStoredGroup(tenantId, groupId);
  },

  async addMember(tenantId, groupId, draft) {
    const member = normalizeMember(draft);
    if (!listStoredGroups(tenantId).some((group) => group.id === groupId)) throw new Error("分组不存在");
    const duplicated = listStoredMembers(tenantId, groupId).some((item) => item.phone === member.phone);
    if (duplicated) throw new Error("该手机号码已在当前分组中");
    insertStoredMember(tenantId, groupId, member);
  },

  async importMembers(tenantId, payload) {
    const fileName = payload.fileName.trim();
    if (!fileName) throw new Error("请先选择 Excel 文件");
    const sheets = normalizeSheets(payload.sheets);
    applyStoredImport(tenantId, fileName, formatImportedAt(new Date()), sheets);
  },
};

export const layeredTrainingGroupRepository: LayeredTrainingGroupRepository = localRepository;

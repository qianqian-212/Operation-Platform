/** 自定义分组中的一位教师 */
export interface LayeredTrainingGroupMemberDraft {
  schoolName: string;
  teacherName: string;
  phone: string;
}

/** 分组名单中的教师 */
export interface LayeredTrainingGroupMember extends LayeredTrainingGroupMemberDraft {
  id: string;
  groupId: string;
}

/** 左侧分组。courseLinked 为真时不可删除 */
export interface LayeredTrainingGroup {
  id: string;
  name: string;
  courseLinked: boolean;
}

/** 一次 Excel 导入记录 */
export interface LayeredTrainingGroupImportRecord {
  id: string;
  fileName: string;
  importedAt: string;
  groupCount: number;
  memberCount: number;
}

/** 一个 Sheet 对应一个分组 */
export interface LayeredTrainingGroupImportSheet {
  groupName: string;
  rows: LayeredTrainingGroupMemberDraft[];
}

export interface LayeredTrainingGroupImportPayload {
  fileName: string;
  sheets: LayeredTrainingGroupImportSheet[];
}

export interface LayeredTrainingGroupMemberQuery {
  groupId: string;
  page: number;
  pageSize: number;
}

export interface LayeredTrainingGroupMemberPage {
  rows: LayeredTrainingGroupMember[];
  total: number;
}

export const GROUP_NAME_MAX_LENGTH = 20;
export const GROUP_MEMBER_TEXT_MAX_LENGTH = 30;
export const GROUP_PHONE_PATTERN = /^1\d{10}$/;

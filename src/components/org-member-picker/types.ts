export type OrgMemberPickerMode = "school" | "person";
export type OrgMemberPersonKind = "teacher" | "student";

export interface OrgMemberPickerSchool {
  id: string;
  name: string;
  stageLabel: string;
  groupLabel: string;
}

export interface OrgMemberPickerPerson {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
  meta: string;
  kind: OrgMemberPersonKind;
  /** 左侧组织树分组，如「语文组」 */
  groupName?: string;
}

export interface OrgMemberPickerSchoolResult {
  selectedIds: string[];
  leadId: string | null;
}

export interface OrgMemberPickerPersonResult {
  selectedIds: string[];
  /** 已选学校，可独立于教师勾选 */
  orgIds: string[];
}

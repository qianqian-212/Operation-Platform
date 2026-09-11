import type { OrgMemberPickerPerson, OrgMemberPickerSchool } from "@/components/org-member-picker/types";

export interface OrgMemberPickerGroup {
  name: string;
  people: OrgMemberPickerPerson[];
}

export interface OrgMemberPickerOrgNode {
  id: string;
  name: string;
  people: OrgMemberPickerPerson[];
  groups: OrgMemberPickerGroup[];
}

export interface OrgMemberPickerSelectedGroup {
  orgId: string;
  orgName: string;
  people: OrgMemberPickerPerson[];
}

export function personGroupName(person: OrgMemberPickerPerson) {
  return person.groupName?.trim() || "全体教师组";
}

export function orgKey(orgId: string) {
  return `org:${orgId}`;
}

export function groupKey(orgId: string, groupName: string) {
  return `group:${orgId}:${groupName}`;
}

export function buildMemberOrgs(
  schools: readonly OrgMemberPickerSchool[],
  people: readonly OrgMemberPickerPerson[],
  orgIds: readonly string[],
): OrgMemberPickerOrgNode[] {
  const allowed = new Set(
    orgIds.length ? orgIds : people.map((person) => person.orgId),
  );
  const schoolName = new Map(schools.map((school) => [school.id, school.name]));
  return Array.from(allowed)
    .map((id) => toOrgNode(id, schoolName.get(id), people))
    .filter((org) => org.people.length > 0);
}

function toOrgNode(
  id: string,
  fallbackName: string | undefined,
  people: readonly OrgMemberPickerPerson[],
): OrgMemberPickerOrgNode {
  const orgPeople = people.filter((person) => person.orgId === id);
  const groupMap = new Map<string, OrgMemberPickerPerson[]>();
  for (const person of orgPeople) {
    const name = personGroupName(person);
    const list = groupMap.get(name) ?? [];
    list.push(person);
    groupMap.set(name, list);
  }
  return {
    id,
    name: fallbackName ?? orgPeople[0]?.orgName ?? id,
    people: orgPeople,
    groups: Array.from(groupMap.entries()).map(([name, groupPeople]) => ({
      name,
      people: groupPeople,
    })),
  };
}

export function allIdsSelected(ids: readonly string[], selected: readonly string[]) {
  return ids.length > 0 && ids.every((id) => selected.includes(id));
}

export function someIdsSelected(ids: readonly string[], selected: readonly string[]) {
  const count = ids.filter((id) => selected.includes(id)).length;
  return count > 0 && count < ids.length;
}

export function mergeIds(current: readonly string[], ids: readonly string[], checked: boolean) {
  if (checked) return Array.from(new Set([...current, ...ids]));
  return current.filter((id) => !ids.includes(id));
}

export function groupSelectedPeople(
  selectedIds: readonly string[],
  people: readonly OrgMemberPickerPerson[],
  selectedOrgIds: readonly string[] = [],
  schools: readonly OrgMemberPickerSchool[] = [],
): OrgMemberPickerSelectedGroup[] {
  const selected = selectedIds
    .map((id) => people.find((person) => person.id === id))
    .filter((person): person is OrgMemberPickerPerson => Boolean(person));
  const map = new Map<string, OrgMemberPickerSelectedGroup>();
  for (const orgId of selectedOrgIds) {
    map.set(orgId, {
      orgId,
      orgName: orgDisplayName(orgId, people, schools),
      people: [],
    });
  }
  for (const person of selected) {
    const current = map.get(person.orgId);
    if (current) {
      current.people.push(person);
      continue;
    }
    map.set(person.orgId, {
      orgId: person.orgId,
      orgName: person.orgName,
      people: [person],
    });
  }
  return Array.from(map.values());
}

function orgDisplayName(
  orgId: string,
  people: readonly OrgMemberPickerPerson[],
  schools: readonly OrgMemberPickerSchool[],
) {
  return (
    schools.find((school) => school.id === orgId)?.name ??
    people.find((person) => person.orgId === orgId)?.orgName ??
    orgId
  );
}

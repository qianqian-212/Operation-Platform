import type { TenantAdministrativeRegion } from "@/types/user";
import type { ArchiveSchool, ArchiveTreeNode } from "./types";

/**
 * 以当前教育局行政区 path 为祖先，将辖区学校挂到叶子行政区下。
 * 省 / 市 / 区节点不可选中驱动表格；仅学校叶子可选。
 */
export function buildArchiveSchoolTree(
  region: TenantAdministrativeRegion | undefined,
  schools: readonly ArchiveSchool[],
  schoolKeyword = "",
): ArchiveTreeNode[] {
  const normalizedKeyword = schoolKeyword.trim().toLowerCase();
  const filteredSchools = schools.filter((school) => (
    !normalizedKeyword || school.name.toLowerCase().includes(normalizedKeyword)
  ));
  const schoolNodes: ArchiveTreeNode[] = filteredSchools.map((school) => ({
    id: `school:${school.id}`,
    label: school.name,
    kind: "school",
    schoolId: school.id,
  }));

  if (!region?.path.length) {
    return [{
      id: "region:unscoped",
      label: "辖区学校",
      kind: "region",
      disabled: true,
      children: schoolNodes,
    }];
  }

  let currentChildren = schoolNodes;
  for (let index = region.path.length - 1; index >= 0; index -= 1) {
    const node = region.path[index]!;
    currentChildren = [{
      id: `region:${node.code}`,
      label: node.name,
      kind: "region",
      disabled: true,
      children: currentChildren,
    }];
  }
  return currentChildren;
}

export function collectDefaultExpandedKeys(nodes: readonly ArchiveTreeNode[]): string[] {
  const keys: string[] = [];
  const visit = (items: readonly ArchiveTreeNode[]) => {
    items.forEach((item) => {
      if (item.kind === "region") {
        keys.push(item.id);
        if (item.children?.length) visit(item.children);
      }
    });
  };
  visit(nodes);
  return keys;
}

/** 深度优先取第一个学校叶子，供进入页面时默认选中。 */
export function findFirstSchoolNode(nodes: readonly ArchiveTreeNode[]): ArchiveTreeNode | null {
  for (const node of nodes) {
    if (node.kind === "school" && node.schoolId) return node;
    if (node.children?.length) {
      const nested = findFirstSchoolNode(node.children);
      if (nested) return nested;
    }
  }
  return null;
}

export function findSchoolNodeById(
  nodes: readonly ArchiveTreeNode[],
  schoolId: string,
): ArchiveTreeNode | null {
  for (const node of nodes) {
    if (node.kind === "school" && node.schoolId === schoolId) return node;
    if (node.children?.length) {
      const nested = findSchoolNodeById(node.children, schoolId);
      if (nested) return nested;
    }
  }
  return null;
}

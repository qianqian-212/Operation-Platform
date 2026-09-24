import {
  menuTemplateChildrenByModule,
  menuTemplateDefaultPageByModule,
  menuTemplateModules,
} from "@/config/menu-template-definitions";
import { bureauMenuOutline } from "@/config/bureau-menu-outline";
import type { MenuOutlineNode } from "@/config/menu-outline";
import { DEVELOPING_PAGE_KEY, pageRegistryByPath } from "@/config/page-registry";
import { schoolMenuOutline } from "@/config/school-menu-outline";
import { MAX_MENU_DEPTH } from "@/features/menu-config/menu-validation";
import type { MenuConfigRecord, MenuItemType } from "@/features/menu-config/types";
import type { MenuIconKey, SideMenuItem } from "@/types/navigation";
import type { TenantInfo, TenantType } from "@/types/user";

const TEMPLATE_TENANT_ID = "__template__";
const pagePathAliases: Record<string, string> = {
  "/security/new-gate": "/security/new-gate/device-list",
};

function record(
  id: string,
  type: MenuItemType,
  name: string,
  parentId: string | null,
  sort: number,
  extras: Partial<MenuConfigRecord> = {},
): MenuConfigRecord {
  return {
    id,
    tenantId: TEMPLATE_TENANT_ID,
    parentId,
    type,
    name,
    icon: null,
    pageKey: null,
    externalUrl: null,
    externalOpenMode: null,
    sort,
    visible: true,
    ...extras,
  };
}

function pageKeyForPath(path: string) {
  const canonicalPath = pagePathAliases[path] ?? path;
  const registeredPage = pageRegistryByPath.get(canonicalPath);
  if (!registeredPage) throw new Error(`菜单模板引用了未注册页面：${path}`);
  return registeredPage.menuOwnerKey;
}

const schoolModuleIcons: Record<string, MenuIconKey> = {
  家校共育: "chat",
  教育教学: "notebook",
  AI教师发展: "GraduationCap",
  教育评价: "data",
  教育管理: "office",
  平安校园: "shield",
  文化生活: "house",
  数据中心: "data",
};

const bureauModuleIcons: Record<string, MenuIconKey> = {
  基础平台: "Building2",
  协同办公: "BriefcaseBusiness",
  教育管理: "School",
  公共服务: "Users",
  AI精准教学: "NotebookTabs",
  AI教师发展: "GraduationCap",
  AI教育治理: "Landmark",
  智慧大脑: "ChartNoAxesCombined",
};

const schoolPageKeysByOutlinePath: Readonly<Record<string, string>> = {
  "AI教师发展/教研与科研/跨校协同教研/跨校团队": "school-cross-school-team",
  "AI教师发展/教研与科研/跨校协同教研/活动管理": "school-cross-school-activity",
  "AI教师发展/教研与科研/跨校协同教研/集体备课管理": "school-collective-lesson-prep",
  "AI教师发展/教研与科研/跨校协同教研/听评课管理": "school-lesson-observation",
  "AI教师发展/教研与科研/跨校协同教研/成果共享": "school-achievement-sharing",
  "AI教师发展/教研与科研/教学监测与研修管理/我的成果": "school-my-training-achievements",
  "AI教师发展/教研与科研/教学监测与研修管理/成果审核": "school-training-achievement-audit",
  "AI教师发展/教研与科研/教学监测与研修管理/预警教师名单": "school-training-warning-teachers",
  "AI教师发展/教研与科研/教学监测与研修管理/研修统计": "school-training-statistics",
};

const bureauPageKeysByOutlinePath: Readonly<Record<string, string>> = {
  "AI精准教学/智慧体育/智慧体育数据驾驶舱": "bureau-smart-sports-cockpit",
  "AI教育治理/学生发展评价/学生成长概览": "bureau-student-growth-portrait",
  "AI教育治理/学生发展评价/学生成长档案": "bureau-student-growth-archive",
  "智慧大脑/数据驾驶舱/区域教育总览": "bureau-regional-education-overview",
  "AI教师发展/教研与科研/跨校协同教研/教研联盟": "bureau-teaching-research-alliance",
  "AI教师发展/教研与科研/跨校协同教研/活动管理": "bureau-cross-school-activity",
  "AI教师发展/教研与科研/跨校协同教研/集体备课管理": "bureau-collective-lesson-prep",
  "AI教师发展/教研与科研/跨校协同教研/听评课管理": "bureau-lesson-observation",
  "AI教师发展/教研与科研/跨校协同教研/成果共享": "bureau-achievement-sharing",
  "AI教师发展/教研与科研/跨校协同教研/效果评估": "bureau-effect-evaluation",
  "AI教师发展/教研与科研/教学监测与研修管理/研修标准配置": "bureau-training-standard-config",
  "AI教师发展/教研与科研/教学监测与研修管理/成果终审": "bureau-training-achievement-review",
  "AI教师发展/教研与科研/教学监测与研修管理/预警管理": "bureau-training-warning",
  "AI教师发展/教研与科研/教学监测与研修管理/研修统计": "bureau-training-statistics",
};

interface FlattenedOutlinePage {
  name: string;
  namePath: string[];
}

function flattenPageLevel(nodes: readonly MenuOutlineNode[], parentNamePath: readonly string[]) {
  const pages: FlattenedOutlinePage[] = [];
  const visit = (node: MenuOutlineNode, namePath: readonly string[]) => {
    const nextNamePath = [...namePath, node.name];
    pages.push({ name: node.name, namePath: nextNamePath });
    node.children.forEach((child) => visit(child, nextNamePath));
  };
  nodes.forEach((node) => visit(node, parentNamePath));
  return pages;
}

function buildOutlineMenuRecords(
  tenantType: TenantType,
  nodes: readonly MenuOutlineNode[],
  parentId: string,
  level: number,
  path: string,
  parentNamePath: readonly string[],
  pageKeysByOutlinePath: Readonly<Record<string, string>>,
): MenuConfigRecord[] {
  if (level >= MAX_MENU_DEPTH) {
    return flattenPageLevel(nodes, parentNamePath).map((page, index) =>
      record(
        `template:${tenantType}:${path}:page:${index}`,
        "page",
        page.name,
        parentId,
        (index + 1) * 10,
        { pageKey: pageKeysByOutlinePath[page.namePath.join("/")] ?? DEVELOPING_PAGE_KEY },
      ),
    );
  }

  return nodes.flatMap((node, index) => {
    const id = `template:${tenantType}:${path}:${index}`;
    const sort = (index + 1) * 10;
    const namePath = [...parentNamePath, node.name];
    if (node.children.length) {
      return [
        record(id, "directory", node.name, parentId, sort),
        ...buildOutlineMenuRecords(
          tenantType,
          node.children,
          id,
          level + 1,
          `${path}:${index}`,
          namePath,
          pageKeysByOutlinePath,
        ),
      ];
    }
    return [
      record(id, "page", node.name, parentId, sort, {
        pageKey: pageKeysByOutlinePath[namePath.join("/")] ?? DEVELOPING_PAGE_KEY,
      }),
    ];
  });
}

function buildOutlineTemplate(
  tenantType: TenantType,
  outline: readonly MenuOutlineNode[],
  moduleIcons: Readonly<Record<string, MenuIconKey>>,
  pageKeysByOutlinePath: Readonly<Record<string, string>> = {},
) {
  return outline.flatMap((module, index) => {
    const moduleId = `template:${tenantType}:module:${index}`;
    return [
      record(moduleId, "module", module.name, null, (index + 1) * 10, {
        icon: moduleIcons[module.name] ?? "menu",
      }),
      ...buildOutlineMenuRecords(
        tenantType,
        module.children,
        moduleId,
        2,
        `module:${index}`,
        [module.name],
        pageKeysByOutlinePath,
      ),
    ];
  });
}

function convertMenuItems(
  tenantType: TenantType,
  moduleKey: string,
  parentId: string,
  items: SideMenuItem[],
): MenuConfigRecord[] {
  return items.flatMap((item, index) => {
    const id = `template:${tenantType}:${moduleKey}:${item.key}`;
    const sort = (index + 1) * 10;

    if (item.children?.length) {
      return [
        record(id, "directory", item.label, parentId, sort, { icon: item.icon ?? null }),
        ...convertMenuItems(tenantType, moduleKey, id, item.children),
      ];
    }

    if (!item.path) return [];
    return [
      record(id, "page", item.label, parentId, sort, {
        icon: item.icon ?? null,
        pageKey: pageKeyForPath(item.path),
      }),
    ];
  });
}

function buildTemplate(tenantType: TenantType): MenuConfigRecord[] {
  return menuTemplateModules
    .filter((tab) => tab.tenantTypes?.includes(tenantType))
    .flatMap((tab, index) => {
      const moduleId = `template:${tenantType}:module:${tab.key}`;
      const moduleRecord = record(
        moduleId,
        "module",
        tab.label,
        null,
        (index + 1) * 10,
        { icon: tab.icon ?? null },
      );
      const configuredMenus = menuTemplateChildrenByModule[tab.key] ?? [];

      if (configuredMenus.length) {
        return [
          moduleRecord,
          ...convertMenuItems(tenantType, tab.key, moduleId, configuredMenus),
        ];
      }

      const defaultPath = menuTemplateDefaultPageByModule[tab.key];
      if (!defaultPath) return [moduleRecord];
      return [
        moduleRecord,
        record(
          `template:${tenantType}:${tab.key}:default-page`,
          "page",
          tab.label,
          moduleId,
          10,
          { pageKey: pageKeyForPath(defaultPath) },
        ),
      ];
    });
}

export const tenantMenuTemplates: Record<TenantType, MenuConfigRecord[]> = {
  school: buildOutlineTemplate(
    "school",
    schoolMenuOutline,
    schoolModuleIcons,
    schoolPageKeysByOutlinePath,
  ),
  bureau: buildOutlineTemplate(
    "bureau",
    bureauMenuOutline,
    bureauModuleIcons,
    bureauPageKeysByOutlinePath,
  ),
  org: buildTemplate("org"),
  platform: buildTemplate("platform"),
};

export function cloneTenantTemplate(tenant: TenantInfo): MenuConfigRecord[] {
  const template = tenantMenuTemplates[tenant.type];
  const idMap = new Map(template.map((item) => [item.id, crypto.randomUUID()]));

  return template.map((item) => ({
    ...item,
    id: idMap.get(item.id)!,
    tenantId: tenant.id,
    parentId: item.parentId ? idMap.get(item.parentId) ?? null : null,
  }));
}

import type { MenuIconKey } from "@/types/navigation";
import type { MenuIconAccent } from "@/features/menu-config/menu-icon-accent";

export type MenuItemType = "module" | "directory" | "page" | "external";
export type ExternalOpenMode = "current" | "new-tab";
export type InternalOpenMode = "current" | "new-tab";

export interface MenuConfigRecord {
  id: string;
  tenantId: string;
  parentId: string | null;
  type: MenuItemType;
  name: string;
  icon: MenuIconKey | null;
  iconAccent?: MenuIconAccent | null;
  pageKey: string | null;
  externalUrl: string | null;
  externalOpenMode: ExternalOpenMode | null;
  sort: number;
  visible: boolean;
}

export type MenuRecordInput = Omit<MenuConfigRecord, "id" | "tenantId">;

export interface MenuTreeNode extends MenuConfigRecord {
  children: MenuTreeNode[];
}

export type MenuTarget =
  | { kind: "internal"; path: string; pageKey: string; openMode: InternalOpenMode }
  | { kind: "external"; url: string; openMode: ExternalOpenMode };

export interface MenuPageReference {
  path: string;
  menuRouteParam?: string | null;
  openMode?: InternalOpenMode;
}

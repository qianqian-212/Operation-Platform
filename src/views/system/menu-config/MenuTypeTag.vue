<template>
  <el-tag size="small" class="menu-type-tag" :type="tagType">
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MenuItemType } from "@/features/menu-config/types";

defineOptions({ name: "MenuTypeTag" });

const props = withDefaults(defineProps<{ type: MenuItemType; level?: number }>(), {
  level: 1,
});

const displayLevel = computed(() => {
  if (props.type === "module") return 1;
  if (props.type === "page" || props.type === "external") return 4;
  return Math.min(3, Math.max(2, props.level));
});
const tagType = computed<"primary" | "info" | "success" | "warning">(() => {
  if (props.type === "module") return "primary";
  if (props.type === "directory") return "info";
  if (props.type === "page") return "success";
  return "warning";
});
const TYPE_LABEL: Record<MenuItemType, string> = {
  module: "模块",
  directory: "目录",
  page: "页面",
  external: "外链",
};

const label = computed(() => {
  if (props.type === "page") return "内部页面";
  const levelLabel = ["", "一级", "二级", "三级", "四级"][displayLevel.value];
  return `${levelLabel}${TYPE_LABEL[props.type]}`;
});
</script>

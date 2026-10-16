<template>
  <aside class="lt-group-pane">
    <el-button type="primary" class="lt-group-create" :icon="Plus" @click="emit('create')">
      新增分组
    </el-button>
    <ul class="lt-group-list">
      <li v-for="group in groupRows" :key="group.id">
        <div class="lt-group-row" :class="{ 'is-active': group.id === selectedId }">
          <button type="button" class="lt-group-name" @click="emit('select', group.id)">
            {{ group.name }}
          </button>
          <el-dropdown trigger="click" @command="emitDelete">
            <button type="button" class="lt-group-more" aria-label="更多操作" @click.stop>
              <el-icon><MoreFilled /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  class="lt-group-delete"
                  :command="group.id"
                  :disabled="group.courseLinked"
                >
                  {{ group.deleteLabel }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MoreFilled, Plus } from "@element-plus/icons-vue";
import type { LayeredTrainingGroup } from "@/features/layered-training-group/types";

defineOptions({ name: "LayeredTrainingGroupSidebar" });

const props = defineProps<{
  /** 当前租户的自定义分组 */
  groups: LayeredTrainingGroup[];
  /** 正在查看的分组 */
  selectedId: string;
}>();

const groupRows = computed(() =>
  props.groups.map((group) => ({
    ...group,
    deleteLabel: group.courseLinked ? "已关联课程，不可删除" : "删除",
  })),
);

const emit = defineEmits<{
  create: [];
  select: [groupId: string];
  delete: [groupId: string];
}>();

function emitDelete(groupId: string | number) {
  if (typeof groupId !== "string") return;
  emit("delete", groupId);
}
</script>

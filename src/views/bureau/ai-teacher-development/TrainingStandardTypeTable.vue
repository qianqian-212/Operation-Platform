<template>
  <el-table
    v-loading="loading"
    :data="rows"
    border
    :span-method="spanMethod"
    class="standard-table"
    height="100%"
  >
    <el-table-column prop="typeName" label="研修类型" min-width="120" />
    <el-table-column prop="levelName" label="等级" min-width="120" />
    <el-table-column
      prop="levelDescription"
      label="等级说明"
      min-width="240"
      show-overflow-tooltip
    />
    <el-table-column label="分值" width="100">
      <template #default="{ row }: { row: TrainingStandardFlatRow }">
        {{ row.scoreLabel }}分
      </template>
    </el-table-column>
    <el-table-column label="类型详解附件" min-width="200">
      <template #default="{ row }: { row: TrainingStandardFlatRow }">
        <span class="file-link" @click="emit('download', row.attachmentName)">
          {{ row.attachmentName }}
        </span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="88" fixed="right">
      <template #default="{ row }: { row: TrainingStandardFlatRow }">
        <span class="action-link" @click="emit('edit', row.typeId)">编辑</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import type { TableColumnCtx } from "element-plus";
import type { TrainingStandardFlatRow } from "@/features/training-standard-config/types";

defineOptions({ name: "TrainingStandardTypeTable" });

defineProps<{
  /** 加载中 */
  loading: boolean;
  /** 扁平化表格行 */
  rows: TrainingStandardFlatRow[];
}>();

const emit = defineEmits<{
  edit: [typeId: string];
  download: [name: string];
}>();

function spanMethod(payload: {
  row: TrainingStandardFlatRow;
  column: TableColumnCtx<TrainingStandardFlatRow>;
  rowIndex: number;
  columnIndex: number;
}) {
  const { row, columnIndex } = payload;
  if (columnIndex === 0 || columnIndex === 4 || columnIndex === 5) {
    if (row.typeRowSpan > 0) return { rowspan: row.typeRowSpan, colspan: 1 };
    return { rowspan: 0, colspan: 0 };
  }
  return { rowspan: 1, colspan: 1 };
}
</script>

<style scoped>
.standard-table {
  width: 100%;
}

.file-link,
.action-link {
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-md);
}

.file-link {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.file-link:hover,
.action-link:hover {
  color: var(--color-primary-hover);
}
</style>

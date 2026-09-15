<template>
  <section class="form-section">
    <h2 class="card-title">基本信息</h2>
    <div class="field-grid">
      <el-form-item label="活动主题" prop="name" required>
        <el-input v-model="form.name" maxlength="60" placeholder="请输入" />
      </el-form-item>
      <el-form-item prop="types" required>
        <template #label>
          活动类型
          <span class="field-hint">可多选，支持同时开展集体备课与听评课</span>
        </template>
        <el-checkbox-group v-model="form.types">
          <el-checkbox value="lesson-prep">集体备课</el-checkbox>
          <el-checkbox value="lesson-observation">听评课</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </div>
    <div class="field-grid">
      <el-form-item label="所属联盟" prop="allianceId" required>
        <el-select
          v-model="form.allianceId"
          placeholder="请选择"
          @change="emit('alliance-change', form.allianceId)"
        >
          <el-option
            v-for="alliance in alliances"
            :key="alliance.id"
            :label="alliance.name"
            :value="alliance.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动时间" prop="scheduledAt" required>
        <el-date-picker
          v-model="form.scheduledAt"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          placeholder="请选择活动时间"
        />
      </el-form-item>
      <el-form-item label="活动地点" prop="location" required>
        <el-input v-model="form.location" maxlength="80" placeholder="请选择" />
      </el-form-item>
    </div>
    <el-form-item label="活动描述" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        maxlength="300"
        placeholder="请输入活动内容与目标描述"
      />
    </el-form-item>
  </section>
</template>

<script setup lang="ts">
import type { ActivityAllianceOption } from "@/features/cross-school-activity/types";
import type { CreateActivityFormState } from "@/views/bureau/ai-teacher-development/create-activity-form";

defineOptions({ name: "CreateActivityBasicFields" });

defineProps<{
  /** 可选教研联盟 */
  alliances: ActivityAllianceOption[];
}>();

const form = defineModel<CreateActivityFormState>("form", { required: true });
const emit = defineEmits<{
  "alliance-change": [allianceId: string];
}>();
</script>

<style scoped src="./create-activity-sections.css"></style>

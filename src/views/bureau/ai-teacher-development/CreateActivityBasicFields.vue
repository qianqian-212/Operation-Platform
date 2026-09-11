<template>
  <section class="form-card">
    <h2 class="card-title">活动基本信息</h2>
    <el-form-item label="活动主题" prop="name" required>
      <el-input
        v-model="form.name"
        maxlength="60"
        show-word-limit
        placeholder="请输入活动主题"
      />
    </el-form-item>
    <el-form-item label="活动类型" prop="type" required>
      <el-radio-group v-model="form.type">
        <el-radio value="lesson-prep">集体备课</el-radio>
        <el-radio value="lesson-observation">听评课</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="所属教研联盟" prop="allianceId">
      <el-select
        v-model="form.allianceId"
        placeholder="可不选，活动可独立发起"
        clearable
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
    <el-form-item label="活动地点" prop="location">
      <el-input v-model="form.location" maxlength="80" placeholder="请输入活动地点，可注明线上同步" />
    </el-form-item>
    <el-form-item label="活动说明" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        maxlength="300"
        show-word-limit
        placeholder="请输入活动说明"
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
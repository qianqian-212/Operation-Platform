<template>
  <section class="etonedu-agent" aria-labelledby="etonedu-agent-title">
    <header class="agent-header">
      <div class="agent-brand">
        <video
          class="agent-logo"
          :src="assistantAvatarVideo"
          autoplay
          loop
          muted
          playsinline
          aria-hidden="true"
        />
        <div class="agent-copy">
          <h2 id="etonedu-agent-title" class="agent-title" aria-label="Etonedu Agent">
            <span class="agent-title-etonedu">Etonedu</span>
            <span class="agent-title-agent">Agent</span>
          </h2>
          <p class="agent-subtitle">输入任务或教务问题，AI 会解析并给出解答</p>
        </div>
      </div>
      <button type="button" class="agent-skill" @click="applySkillPrompt">
        <img :src="sparkleSkill" alt="" width="20" height="20" />
        填入教育管理方案
      </button>
    </header>

    <form class="agent-composer" @submit.prevent="submitPrompt">
      <label class="sr-only" for="etonedu-agent-input">任务或教务问题</label>
      <div class="agent-prompt">
        <img class="agent-prompt-icon" :src="sparkleInput" alt="" width="20" height="20" />
        <textarea
          id="etonedu-agent-input"
          v-model="prompt"
          rows="3"
          maxlength="2000"
          placeholder="例如：智慧课堂 如何查看班级到课率"
          @keydown.enter.exact.prevent="submitPrompt"
        />
      </div>
      <div class="agent-toolbar">
        <button
          type="button"
          class="agent-icon-btn"
          aria-label="添加附件"
          @click="notifyAttachment"
        >
          <img :src="paperclipIcon" alt="" width="13" height="18" />
        </button>
        <div class="agent-toolbar-end">
          <el-dropdown trigger="click" @command="selectThinkingMode">
            <button
              type="button"
              class="agent-thinking"
              :aria-label="`选择推理模式：${thinkingMode}`"
              aria-haspopup="menu"
            >
              {{ thinkingMode }}
              <img :src="chevronDown" alt="" width="8" height="5" />
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="mode in thinkingModes" :key="mode" :command="mode">
                  {{ mode }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <button type="submit" class="agent-send" :disabled="!canSend" aria-label="发送">
            <img :src="sendWave" alt="" width="16" height="14" />
          </button>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import assistantAvatarVideo from "@/assets/ai-assistant/avatar.webm";
import sparkleSkill from "@/assets/workbench/etonedu-agent/sparkle-skill.svg";
import sparkleInput from "@/assets/workbench/etonedu-agent/sparkle-input.svg";
import paperclipIcon from "@/assets/workbench/etonedu-agent/paperclip.svg";
import chevronDown from "@/assets/workbench/etonedu-agent/chevron-down.svg";
import sendWave from "@/assets/workbench/etonedu-agent/send-wave.svg";
import { useAiAssistantStore } from "@/stores/ai-assistant";
import { useUserStore } from "@/stores/user";
import type { WorkbenchAgentData } from "@/features/workbench/types";

defineOptions({ name: "WorkbenchEtoneduAgent" });

defineProps<{
  /** 公共 Agent 组件占位数据，界面文案以设计稿为准。 */
  data: WorkbenchAgentData;
}>();

const SKILL_PROMPT = "请基于当前工作台，给出一份教育管理方案。";
const thinkingModes = ["深度思考", "快速"] as const;
type ThinkingMode = (typeof thinkingModes)[number];

const prompt = ref("");
const thinkingMode = ref<ThinkingMode>("深度思考");
const sending = ref(false);
const aiAssistantStore = useAiAssistantStore();
const { currentTenant, userInfo } = storeToRefs(useUserStore());
const canSend = computed(() => prompt.value.trim().length > 0 && !sending.value);

function applySkillPrompt() {
  prompt.value = SKILL_PROMPT;
}

function notifyAttachment() {
  ElMessage.info("附件上传即将开放");
}

function selectThinkingMode(command: string | number | object) {
  if (command === "深度思考" || command === "快速") thinkingMode.value = command;
}

async function submitPrompt() {
  const content = prompt.value.trim();
  if (!content || sending.value) return;
  const tenantId = currentTenant.value.id;
  const userId = userInfo.value.id;
  if (!tenantId || !userId) {
    ElMessage.warning("请先登录后再使用 AI 助手");
    return;
  }
  sending.value = true;
  prompt.value = "";
  aiAssistantStore.open();
  try {
    await aiAssistantStore.initialize({ tenantId, userId });
    const sent = await aiAssistantStore.sendMessage(content);
    if (!sent) prompt.value = content;
  } finally {
    sending.value = false;
  }
}
</script>

<style scoped>
@font-face {
  font-family: "Special Gothic Expanded One";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("@/assets/workbench/etonedu-agent/special-gothic-expanded-one.woff2") format("woff2");
}

.etonedu-agent {
  --agent-gradient-from: #2969ff;
  --agent-gradient-to: #13e7ff;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  min-height: 266px;
  padding: var(--spacing-20);
  overflow: hidden;
  background:
    radial-gradient(
      120% 80% at 50% 120%,
      rgb(19 231 255 / 22%) 0%,
      rgb(41 105 255 / 14%) 36%,
      var(--color-white) 68%
    ),
    var(--color-white);
  border-radius: var(--workbench-widget-radius);
}

.agent-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-8);
  width: 100%;
}

.agent-brand {
  display: flex;
  flex: 1 1 28rem;
  min-width: 0;
  align-items: center;
  gap: var(--spacing-12);
}

.agent-logo {
  display: block;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: var(--radius-full);
}

.agent-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-4);
}

.agent-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  margin: 0;
  font-family: "Special Gothic Expanded One", "PingFang SC", "Noto Sans SC", sans-serif;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.agent-title-etonedu {
  color: var(--color-title);
}

.agent-title-agent {
  margin-inline-start: 0.28em;
  background-image: linear-gradient(
    90deg,
    var(--agent-gradient-from) 0%,
    var(--agent-gradient-to) 100%
  );
  background-clip: text;
  color: var(--agent-gradient-from);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (forced-colors: active) {
  .agent-title-agent {
    background-image: none;
    color: CanvasText;
    -webkit-text-fill-color: CanvasText;
  }
}

.agent-subtitle {
  margin: 0;
  color: var(--color-body);
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
  text-wrap: pretty;
}

.agent-skill {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--spacing-8);
  margin-inline-start: auto;
  padding: var(--spacing-8) var(--spacing-12);
  color: var(--color-title);
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
  background: var(--color-bg);
  border: 0;
  border-radius: var(--radius-xl);
  cursor: pointer;
}

.agent-skill:focus-visible,
.agent-icon-btn:focus-visible,
.agent-thinking:focus-visible,
.agent-send:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.agent-composer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  padding: var(--spacing-16);
  background: rgb(9 61 255 / 5%);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.agent-prompt {
  display: flex;
  align-items: flex-start;
  min-height: 88px;
  gap: var(--spacing-8);
}

.agent-prompt-icon {
  margin-top: 1px;
  flex-shrink: 0;
}

.agent-composer textarea {
  width: 100%;
  min-height: 88px;
  padding: 0;
  overflow: auto;
  color: var(--color-title);
  font: inherit;
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
  background: transparent;
  border: 0;
  outline: none;
  resize: none;
}

.agent-composer textarea::placeholder {
  color: var(--color-body);
}

.agent-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.agent-toolbar-end {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
}

.agent-icon-btn,
.agent-thinking {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  padding: 0;
  color: var(--color-body);
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
  background: transparent;
  border: 0;
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.agent-thinking {
  gap: var(--spacing-6);
  padding-inline: var(--spacing-8);
}

.agent-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--color-primary);
  border: 0;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: scale 160ms cubic-bezier(0.2, 0, 0, 1);
}

.agent-send:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.agent-send:active:not(:disabled) {
  scale: 0.96;
}

.agent-send:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.agent-send img {
  display: block;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .agent-send {
    transition: none;
  }

  .agent-send:active:not(:disabled) {
    scale: 1;
  }
}

@container (max-width: 720px) {
  .agent-title {
    font-size: 20px;
    letter-spacing: -0.01em;
  }

  .agent-logo {
    width: 48px;
    height: 48px;
  }
}

@container (max-width: 640px) {
  .agent-composer textarea {
    font-size: var(--font-size-lg);
  }
}
</style>

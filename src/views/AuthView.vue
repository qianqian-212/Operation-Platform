<template>
  <main ref="authPage" class="auth-page">
    <section class="auth-intro" aria-labelledby="auth-intro-title">
      <header class="auth-brand">
        <img class="auth-brand-logo" :src="etoneduLogo" alt="宜教通 Etonedu" />
      </header>

      <div class="auth-intro-content">
        <p class="auth-eyebrow">SMART EDUCATION · 智慧教育</p>
        <h1 id="auth-intro-title" :aria-label="headlinePhrases[0].label">
          <span class="auth-headline-stage" aria-hidden="true">
            <span
              v-for="phrase in headlinePhrases"
              :key="phrase.label"
              class="auth-headline-phrase"
            >
              <span
                v-for="(line, lineIndex) in phrase.lines"
                :key="`${phrase.label}:${lineIndex}`"
                class="auth-headline-line"
              >
                <span
                  v-for="(character, characterIndex) in line"
                  :key="`${phrase.label}:${lineIndex}:${characterIndex}`"
                  class="auth-headline-character"
                >
                  {{ character }}
                </span>
              </span>
            </span>
          </span>
        </h1>
        <p class="auth-intro-description">
          面向教育局的区域教育治理、资源统筹与数据决策工作台
        </p>

        <dl class="auth-capabilities" aria-label="平台能力">
          <div
            v-for="(stat, index) in authStats"
            :key="stat.label"
            class="auth-capability"
          >
            <dt>
              <span class="auth-stat-number" :data-stat-index="index">
                {{ formatAuthStat(stat, stat.value) }}
              </span>
              <small>{{ stat.suffix }}</small>
            </dt>
            <dd>{{ stat.label }}</dd>
          </div>
        </dl>
      </div>

      <footer class="auth-intro-footer">
        © {{ currentYear }} 智慧校园运营管理平台
      </footer>
    </section>

    <section class="auth-panel" aria-labelledby="auth-form-title">
      <div class="auth-form-shell">
        <header class="auth-form-header">
          <p class="auth-form-kicker">WELCOME BACK</p>
          <h2 id="auth-form-title">登录账号</h2>
          <p>使用您的账号访问系统</p>
        </header>

        <el-form class="auth-form" label-position="top" @submit.prevent="handleSubmit">
          <el-form-item label="邮箱">
            <el-input
              v-model="email"
              size="large"
              autocomplete="username"
              placeholder="请输入登录邮箱"
              clearable
            />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="password"
              size="large"
              type="password"
              show-password
              autocomplete="current-password"
              placeholder="请输入密码"
            />
          </el-form-item>
          <el-alert
            v-if="errorMessage"
            class="auth-error"
            :title="errorMessage"
            type="error"
            show-icon
            :closable="false"
          />
          <el-button
            class="submit-button"
            type="primary"
            size="large"
            native-type="submit"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form>

        <div class="auth-security-note">
          <Shield :size="15" :stroke-width="1.8" aria-hidden="true" />
          <span>账号认证由 Supabase Auth 安全提供</span>
        </div>
      </div>

      <footer class="auth-panel-footer">
        <span>组织数据隔离</span>
        <span aria-hidden="true">·</span>
        <span>权限默认拒绝</span>
        <span aria-hidden="true">·</span>
        <span>安全访问</span>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Shield } from "@lucide/vue";
import { gsap } from "gsap";
import etoneduLogo from "@/assets/etondeulogo.svg";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";

interface AuthStat {
  value: number;
  suffix: string;
  label: string;
  format: "integer" | "compact";
}

const headlinePhrases = [
  {
    label: "让数据驱动，每一次教育管理决策",
    lines: [Array.from("让数据驱动"), Array.from("每一次教育管理决策")],
  },
  {
    label: "让资源配置，回应每一所学校需求",
    lines: [Array.from("让资源配置"), Array.from("回应每一所学校需求")],
  },
  {
    label: "让治理洞察，服务区域教育高质量发展",
    lines: [Array.from("让治理洞察"), Array.from("服务区域教育高质量发展")],
  },
] as const;

const authStats: readonly AuthStat[] = [
  { value: 1_248, suffix: "所", label: "本学期活跃学校", format: "integer" },
  { value: 86_000, suffix: "+", label: "累计课时分析", format: "compact" },
  { value: 13_000, suffix: "+", label: "AI 研究诊断", format: "compact" },
];

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();
const { loading, errorMessage } = storeToRefs(authStore);
const authPage = ref<HTMLElement>();
const email = ref("");
const password = ref("");
const currentYear = new Date().getFullYear();
let animationMedia: ReturnType<typeof gsap.matchMedia> | undefined;

function formatAuthStat(stat: AuthStat, value: number) {
  if (stat.format === "compact") return `${Math.round(value / 1_000)}K`;
  return Math.round(value).toLocaleString("zh-CN");
}

function renderStatValue(element: HTMLElement, stat: AuthStat, value: number) {
  element.textContent = formatAuthStat(stat, value);
}

function createHeadlineTimeline(phraseElements: HTMLElement[]) {
  const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });

  gsap.set(phraseElements, { autoAlpha: 0 });

  phraseElements.forEach((phraseElement) => {
    const characters = Array.from(
      phraseElement.querySelectorAll<HTMLElement>(".auth-headline-character"),
    );
    timeline
      .set(phraseElement, { autoAlpha: 1 })
      .fromTo(
        characters,
        { autoAlpha: 0, y: 9, scale: 0.965 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          stagger: 0.07,
          ease: "power2.out",
        },
      )
      .to({}, { duration: 5 })
      .to(characters, {
        autoAlpha: 0,
        y: -7,
        scale: 0.98,
        duration: 0.18,
        stagger: { each: 0.035, from: "end" },
        ease: "power1.in",
      })
      .set(phraseElement, { autoAlpha: 0 })
      .to({}, { duration: 0.28 });
  });

  return timeline;
}

onMounted(() => {
  if (!authPage.value) return;

  animationMedia = gsap.matchMedia();
  animationMedia.add(
    {
      reduceMotion: "(prefers-reduced-motion: reduce)",
      motionAllowed: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const reduceMotion = Boolean(context.conditions?.reduceMotion);
      const statElements = Array.from(
        authPage.value?.querySelectorAll<HTMLElement>(".auth-stat-number") ?? [],
      );
      const phraseElements = Array.from(
        authPage.value?.querySelectorAll<HTMLElement>(".auth-headline-phrase") ?? [],
      );

      statElements.forEach((element, index) => {
        const stat = authStats[index];
        if (!stat) return;
        if (reduceMotion) {
          renderStatValue(element, stat, stat.value);
          return;
        }

        const counter = { value: 0 };
        renderStatValue(element, stat, 0);
        gsap.to(counter, {
          value: stat.value,
          duration: 1.65,
          delay: index * 0.12,
          ease: "power2.out",
          onUpdate: () => renderStatValue(element, stat, counter.value),
          onComplete: () => renderStatValue(element, stat, stat.value),
        });
      });

      if (reduceMotion) {
        gsap.set(phraseElements, { autoAlpha: 0 });
        const firstPhrase = phraseElements[0];
        if (firstPhrase) {
          gsap.set(firstPhrase, { autoAlpha: 1 });
          gsap.set(firstPhrase.querySelectorAll(".auth-headline-character"), {
            autoAlpha: 1,
            y: 0,
            scale: 1,
          });
        }
        return;
      }

      createHeadlineTimeline(phraseElements);
    },
    authPage.value,
  );
});

onUnmounted(() => {
  animationMedia?.revert();
  animationMedia = undefined;
});

async function handleSubmit() {
  if (!email.value.trim() || !password.value) {
    ElMessage.warning("请输入邮箱和密码");
    return;
  }
  try {
    const session = await authStore.signIn(email.value, password.value);
    await userStore.initializePersistence(session.user, true);
    await router.replace(userStore.currentTenant.id ? "/workbench" : "/menu-unavailable");
  } catch (error) {
    if (!errorMessage.value) {
      ElMessage.error(error instanceof Error ? error.message : "登录失败");
    }
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  min-width: 0;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  background: var(--color-white);
}

.auth-intro {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
  padding:
    clamp(var(--spacing-32), 4.2vw, 60px)
    clamp(var(--spacing-64), 10vw, 144px)
    var(--spacing-32);
  overflow: hidden;
  color: var(--color-white);
  background:
    radial-gradient(
      circle at 18% 92%,
      color-mix(in srgb, var(--color-primary-line) 58%, transparent),
      transparent 42%
    ),
    linear-gradient(
      158deg,
      color-mix(in srgb, var(--color-title) 68%, var(--color-primary-dark-text)) 0%,
      var(--color-primary-dark-text) 52%,
      var(--color-primary) 100%
    );
}

.auth-intro::before,
.auth-intro::after {
  position: absolute;
  content: "";
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--color-white) 8%, transparent);
  border-radius: var(--radius-full);
}

.auth-intro::before {
  width: min(46vw, 660px);
  aspect-ratio: 1;
  right: -31%;
  bottom: -45%;
}

.auth-intro::after {
  width: min(33vw, 470px);
  aspect-ratio: 1;
  right: -19%;
  bottom: -32%;
}

.auth-brand {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-height: 23px;
  color: color-mix(in srgb, var(--color-white) 78%, transparent);
}

.auth-brand-logo {
  display: block;
  width: 203px;
  height: 23px;
}

.auth-intro-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  padding: var(--spacing-32) 0;
}

.auth-eyebrow,
.auth-form-kicker {
  margin: 0;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.14em;
}

.auth-eyebrow {
  color: color-mix(in srgb, var(--color-primary-line-light) 62%, transparent);
  font-weight: 300;
}

.auth-intro h1 {
  position: relative;
  min-height: 2.6em;
  margin: var(--spacing-16) 0 var(--spacing-12);
  font-size: clamp(32px, 3vw, 44px);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.015em;
}

.auth-headline-stage,
.auth-headline-phrase {
  position: absolute;
  inset: 0;
}

.auth-headline-phrase {
  visibility: hidden;
  opacity: 0;
}

.auth-headline-phrase:first-child {
  visibility: visible;
  opacity: 1;
}

.auth-headline-line {
  display: block;
  white-space: nowrap;
}

.auth-headline-character {
  display: inline-block;
  will-change: transform, opacity;
}

.auth-intro-description {
  max-width: 390px;
  margin: 0;
  color: color-mix(in srgb, var(--color-white) 48%, transparent);
  font-size: var(--font-size-md);
  font-weight: 300;
  line-height: var(--line-height-lg);
}

.auth-capabilities {
  display: flex;
  align-items: stretch;
  margin: clamp(var(--spacing-32), 5.2vw, 56px) 0 0;
}

.auth-capability {
  display: flex;
  min-width: max-content;
  flex-direction: column;
  gap: var(--spacing-4);
}

.auth-capability + .auth-capability {
  margin-left: clamp(var(--spacing-20), 3.2vw, 48px);
}

.auth-capability dt {
  display: flex;
  align-items: baseline;
  color: var(--color-white);
  font-size: clamp(30px, 3vw, 44px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.auth-capability dt small {
  margin-left: var(--spacing-6);
  color: color-mix(in srgb, var(--color-white) 48%, transparent);
  font-size: var(--font-size-md);
  font-weight: 300;
  letter-spacing: normal;
}

.auth-capability dd {
  color: color-mix(in srgb, var(--color-white) 38%, transparent);
  font-size: var(--font-size-xs);
  font-weight: 300;
  line-height: var(--line-height-xs);
  letter-spacing: 0.04em;
}

.auth-intro-footer {
  position: relative;
  z-index: 1;
  color: color-mix(in srgb, var(--color-white) 24%, transparent);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.auth-panel {
  display: flex;
  width: clamp(480px, 44.45vw, 640px);
  flex: 0 0 auto;
  flex-direction: column;
  background: var(--color-white);
}

.auth-form-shell {
  display: flex;
  width: min(360px, calc(100% - var(--spacing-48, 48px)));
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  padding: var(--spacing-64) 0;
}

.auth-form-header {
  margin-bottom: 44px;
}

.auth-form-kicker {
  display: none;
  color: var(--color-primary);
}

.auth-form-header h2 {
  margin: 0;
  color: var(--color-title);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.auth-form-header p {
  margin: var(--spacing-8) 0 0;
  color: var(--color-secondary);
  font-size: var(--font-size-md);
  font-weight: 300;
  line-height: var(--line-height-md);
}

.auth-form {
  width: 100%;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-20);
}

.auth-form :deep(.el-form-item__label) {
  height: auto;
  margin-bottom: var(--spacing-8);
  padding: 0;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: 18px;
}

.auth-form :deep(.el-input__wrapper) {
  min-height: 48px;
  padding: 1px var(--spacing-14);
  background: var(--color-bg-page);
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--color-bg-soft) inset;
  transition:
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.auth-form :deep(.el-input__wrapper:hover) {
  background: var(--color-white);
  box-shadow: 0 0 0 1px var(--color-primary-line) inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  background: var(--color-white);
  box-shadow:
    0 0 0 1px var(--color-primary) inset,
    0 0 0 3px var(--color-primary-light);
}

.auth-error {
  margin: 0 0 var(--spacing-20);
}

.submit-button {
  width: 100%;
  min-height: 50px;
  margin-top: var(--spacing-12);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.12em;
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-primary) 28%, transparent);
}

.auth-security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-6);
  margin-top: var(--spacing-24);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-weight: 300;
}

.auth-panel-footer {
  display: flex;
  min-height: 68px;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-8);
  padding: var(--spacing-20) var(--spacing-32) var(--spacing-24);
  color: var(--color-placeholder);
  font-size: 11px;
  font-weight: 300;
}

@media (max-width: 1100px) {
  .auth-intro {
    padding-right: var(--spacing-64);
    padding-left: var(--spacing-64);
  }

  .auth-capability {
    min-width: max-content;
  }

  .auth-capability + .auth-capability {
    margin-left: var(--spacing-24);
  }

}

@media (max-width: 960px) {
  .auth-page {
    display: block;
    min-height: 100svh;
    overflow: auto;
    background: var(--color-bg);
  }

  .auth-intro {
    min-height: 300px;
    padding: var(--spacing-32) clamp(var(--spacing-24), 8vw, var(--spacing-64));
  }

  .auth-intro-content {
    padding: var(--spacing-32) 0 var(--spacing-16);
  }

  .auth-intro h1 {
    margin-top: var(--spacing-12);
    font-size: 32px;
  }

  .auth-intro-description {
    max-width: 480px;
  }

  .auth-capabilities,
  .auth-intro-footer {
    display: none;
  }

  .auth-panel {
    width: 100%;
    min-height: calc(100svh - 300px);
  }

  .auth-form-shell {
    width: min(420px, calc(100% - var(--spacing-48, 48px)));
    padding: 48px 0 var(--spacing-32);
  }

  .auth-form-header {
    margin-bottom: var(--spacing-32);
  }

  .auth-form-kicker {
    display: block;
    margin-bottom: var(--spacing-8);
  }
}

@media (max-width: 540px) {
  .auth-intro {
    min-height: 232px;
    padding: var(--spacing-24);
  }

  .auth-intro-description {
    display: none;
  }

  .auth-brand-logo {
    width: 176px;
    height: auto;
  }

  .auth-intro-content {
    padding: var(--spacing-24) 0 0;
  }

  .auth-eyebrow {
    font-size: 10px;
  }

  .auth-intro h1 {
    margin-bottom: 0;
    font-size: 26px;
  }

  .auth-panel {
    min-height: calc(100svh - 232px);
  }

  .auth-form-shell {
    width: calc(100% - var(--spacing-48, 48px));
    padding-top: var(--spacing-32);
  }

  .auth-form-header h2 {
    font-size: 26px;
  }

  .auth-panel-footer {
    min-height: 56px;
    flex-wrap: wrap;
    padding: var(--spacing-16) var(--spacing-24);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-form :deep(.el-input__wrapper) {
    transition: none;
  }
}
</style>

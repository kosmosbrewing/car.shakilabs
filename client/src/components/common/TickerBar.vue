<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    messages: readonly string[];
    intervalMs?: number;
  }>(),
  {
    intervalMs: 4000,
  }
);

const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;
let mediaQuery: MediaQueryList | null = null;
const prefersReducedMotion = ref(false);
let motionChangeHandler: ((event: MediaQueryListEvent) => void) | null = null;

const safeMessages = computed(() =>
  props.messages.length > 0
    ? props.messages
    : ["자동차 비용 데이터는 정기적으로 업데이트됩니다"]
);

const currentMessage = computed(
  () => safeMessages.value[currentIndex.value % safeMessages.value.length]
);

function rotateMessage(): void {
  currentIndex.value = (currentIndex.value + 1) % safeMessages.value.length;
}

function stopTimer(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}

function startTimer(): void {
  if (prefersReducedMotion.value || document.visibilityState === "hidden" || timer) {
    return;
  }
  timer = setInterval(rotateMessage, props.intervalMs);
}

function handleVisibilityChange(): void {
  if (document.visibilityState === "hidden") {
    stopTimer();
    return;
  }
  startTimer();
}

onMounted(() => {
  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion.value = mediaQuery.matches;
  motionChangeHandler = (event: MediaQueryListEvent) => {
    prefersReducedMotion.value = event.matches;
    if (event.matches) {
      stopTimer();
      return;
    }
    startTimer();
  };
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", motionChangeHandler);
  } else {
    mediaQuery.addListener(motionChangeHandler);
  }
  document.addEventListener("visibilitychange", handleVisibilityChange);
  startTimer();
});

onUnmounted(() => {
  stopTimer();
  if (mediaQuery && motionChangeHandler) {
    if (typeof mediaQuery.removeEventListener === "function") {
      mediaQuery.removeEventListener("change", motionChangeHandler);
    } else {
      mediaQuery.removeListener(motionChangeHandler);
    }
  }
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <div class="w-full min-w-0" role="status" aria-live="polite" aria-atomic="true">
    <Transition name="ticker-fade" mode="out-in">
      <p :key="currentMessage" class="w-full min-w-0 truncate text-center text-caption leading-tight text-foreground/75 sm:text-body">
        {{ currentMessage }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.ticker-fade-enter-active,
.ticker-fade-leave-active {
  transition: opacity 0.2s ease;
}

.ticker-fade-enter-from,
.ticker-fade-leave-to {
  opacity: 0;
}
</style>

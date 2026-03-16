<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import TickerBar from "@/components/common/TickerBar.vue";
import { Button } from "@/components/ui/button";
import { tickerMessages } from "@/data/tickerMessages";

const THEME_STORAGE_KEY = "car:theme:v1";
type ThemeMode = "light" | "dark";

const theme = ref<ThemeMode>("light");

function applyTheme(next: ThemeMode): void {
  theme.value = next;
  document.documentElement.classList.toggle("dark", next === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, next);
}

function toggleTheme(): void {
  applyTheme(theme.value === "dark" ? "light" : "dark");
}

onMounted(() => {
  theme.value = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
});
</script>

<template>
  <header class="border-b border-border bg-primary/8">
    <div class="container pt-2.5 pb-2.5">
      <div class="overflow-hidden">
        <div class="retro-titlebar h-11 border-b-0 bg-transparent px-1.5 sm:px-2">
          <div class="flex h-full w-full items-center gap-2.5 sm:gap-4">
            <RouterLink
              to="/tax"
              aria-label="자동차 계산기 홈"
              class="inline-flex h-8 shrink-0 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <span
                class="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary px-2 text-[11px] font-black tracking-[0.18em] text-primary-foreground"
                aria-hidden="true"
              >
                CAR
              </span>
              <span class="hidden font-brand text-tiny font-semibold tracking-wide text-foreground/90 sm:inline">
                car.shakilabs.com
              </span>
            </RouterLink>

            <div class="flex h-full flex-1 items-center justify-center overflow-hidden text-center font-brand text-tiny sm:text-body">
              <TickerBar :messages="tickerMessages" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="iconSm"
              class="shrink-0 border-border/70 bg-transparent text-muted-foreground hover:border-primary hover:text-primary"
              :aria-label="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'"
              @click="toggleTheme"
            >
              <Moon v-if="theme === 'dark'" class="h-4 w-4" />
              <Sun v-else class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

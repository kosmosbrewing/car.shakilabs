<script setup lang="ts">
// v3 §3.2 BL-003/004 — 전역 헤더는 패키지 ShGlobalHeader가 소유한다(검정 #0A0A0A, 56px).
// 앱은 링크·테마 토글만 utility 슬롯에 채우고 자체 헤더 마크업을 갖지 않는다.
import { onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShButton, ShGlobalHeader, type GlobalHeaderLink } from "@shakilabs/ui";

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

// 사이트 링크는 최소한만 — 블로그는 이 앱 라우터 밖(포털 소유)이라 href
const links: GlobalHeaderLink[] = [{ href: "/blog", label: "블로그" }];
</script>

<template>
  <ShGlobalHeader
    home-href="/"
    brand="ShakiLabs"
    :links="links"
    :link-component="RouterLink"
  >
    <template #utility>
      <ShButton
        type="button"
        variant="ghost"
        size="sm"
        class="header-theme-toggle"
        :aria-label="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'"
        @click="toggleTheme"
      >
        <Moon v-if="theme === 'dark'" class="h-4 w-4" />
        <Sun v-else class="h-4 w-4" />
      </ShButton>
    </template>
  </ShGlobalHeader>
</template>

<style scoped>
/* ShButton ghost 변형은 --sh-color-text(앱 ink)를 쓴다 — 검정 헤더 위에서는
   header-ink(흰색)로 강제해야 보인다. 패키지 링크 hover와 같은 톤(#ffffff1a)으로 맞춘다. */
.header-theme-toggle {
  color: var(--sh-color-header-ink, #fafafa);
}

.header-theme-toggle:hover {
  background: #ffffff1a;
  color: var(--sh-color-header-ink, #fafafa);
}
</style>

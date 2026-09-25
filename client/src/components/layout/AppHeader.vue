<script setup lang="ts">
// v3 §3.2 BL-003/004 — 전역 헤더는 패키지 ShGlobalHeader가 소유한다(검정 #0A0A0A, 56px).
// 앱은 링크·테마 토글만 utility 슬롯에 채우고 자체 헤더 마크업을 갖지 않는다.
// 0.3.38 "순수 내비게이션"(2026-09-25): 헤더는 위치(로고 / 앱 이름)와 이동(블로그·소개·☰)만 싣는다.
import { computed, onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { useRoute } from "vue-router";
import {
  ShButton,
  ShGlobalHeader,
  type GlobalHeaderLink,
  type PrimaryNavigationItem,
} from "@shakilabs/ui";
import { CAR_TOOLS } from "@/data/carNavigation";

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

// 모바일 전체 메뉴(☰)에 실을 도구 목록 — 2차 내비와 같은 출처를 쓴다
const route = useRoute();
const navItems: readonly PrimaryNavigationItem[] = [
  { key: "all", label: "차량 도구", to: "/all" },
  ...CAR_TOOLS.map((tool) => ({
    key: tool.key,
    label: tool.navigationLabel,
    to: tool.path,
  })),
];
const navActiveKey = computed(
  () =>
    navItems.find(
      (item) => route.path === item.to || route.path.startsWith(`${item.to}/`),
    )?.key ?? "",
);

// 사이트 링크 — 블로그는 포털 소유라 href, 소개는 이 앱 라우트라 RouterLink(to). 모바일에서는 ☰ 안으로 들어간다.
const links: GlobalHeaderLink[] = [
  { href: "/blog", label: "블로그" },
  { to: "/about", label: "소개" },
];
</script>

<template>
  <ShGlobalHeader
    app="car"
    home-href="/"
    brand="ShakiLabs"
    :links="links"
    :nav-items="navItems"
    :nav-active-key="navActiveKey"
    :link-component="RouterLink"
  >
    <template #utility>
      <ShButton
        type="button"
        variant="ghost"
        size="sm"
        :aria-label="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'"
        @click="toggleTheme"
      >
        <Moon v-if="theme === 'dark'" class="h-4 w-4" />
        <Sun v-else class="h-4 w-4" />
      </ShButton>
    </template>
  </ShGlobalHeader>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ShText } from "@shakilabs/ui";
import { useConstantsStore } from "@/stores/constants";

const year = new Date().getFullYear();
const constantsStore = useConstantsStore();
</script>

<template>
  <footer class="mt-8 border-t border-border/60 bg-muted/20">
    <div class="container py-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ShText as="p" variant="label">shakilabs.com/car</ShText>
        <nav aria-label="푸터 링크" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem]">
          <RouterLink to="/about" class="text-muted-foreground transition-colors hover:text-foreground">
            사이트 안내
          </RouterLink>
          <RouterLink to="/terms" class="text-muted-foreground transition-colors hover:text-foreground">
            이용약관
          </RouterLink>
          <RouterLink to="/privacy" class="text-muted-foreground transition-colors hover:text-foreground">
            개인정보 처리방침
          </RouterLink>
          <a
            :href="`mailto:${constantsStore.supportEmail}`"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            문의
          </a>
        </nav>
      </div>

      <div class="mt-3 space-y-1 border-t border-border/40 pt-3">
        <ShText as="p" variant="label" tone="muted">
          기준 데이터 확인일: {{ constantsStore.feeDataUpdated }} | 계산 결과는 참고용이며 실제 견적·보험료와 차이가 있을 수 있습니다.
        </ShText>
        <ShText as="p" variant="label" tone="muted">
          Copyright &copy; {{ year }} shakilabs.com
        </ShText>
      </div>
    </div>
  </footer>
</template>

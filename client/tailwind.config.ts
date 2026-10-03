import animate from "tailwindcss-animate";
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  prefix: "",
  content: ["./index.html", "./src/**/*.{ts,vue}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        // 검정 헤더(.sh-global-header__inner)가 72rem(1152px)인데 본문 컨테이너만 960px이면
        // 헤더만 혼자 넓어 보인다 — 72rem + 좌우 padding 32px = 1184px로 맞춘다.
        xl: "1184px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          ...fontFamily.sans,
        ],
        title: [
          "Pretendard",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          ...fontFamily.sans,
        ],
        brand: [
          "GmarketSans",
          "Pretendard",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          ...fontFamily.sans,
        ],
      },
      fontSize: {
        display: ["1.625rem", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["1.25rem", { lineHeight: "1.3", fontWeight: "700" }],
        heading: ["1rem", { lineHeight: "1.35", fontWeight: "600" }],
        body: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["0.8125rem", { lineHeight: "1.45", fontWeight: "400" }],
        tiny: ["0.8125rem", { lineHeight: "1.45", fontWeight: "400" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // fee(로컬 빨강 별칭)는 2026-09-17 폐기 — 위험은 status.danger로.
        status: {
          // success만 foreground를 갖는다(2026-10-03) — text-status-success-foreground가
          // 소스에서 쓰이고 있었는데 이 키가 없어 유틸리티 자체가 생성되지 않았다(배지
          // 대비 결함의 근본 원인). 다른 상태색은 전경 토큰을 쓰는 곳이 없어 범위를 넓히지 않는다.
          success: {
            DEFAULT: "hsl(var(--status-success))",
            foreground: "hsl(var(--status-success-foreground))",
          },
          warning: "hsl(var(--status-warning))",
          caution: "hsl(var(--status-caution))",
          danger: "hsl(var(--status-danger))",
          info: "hsl(var(--status-info))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "collapsible-down": {
          from: { height: 0 },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-in-out",
        "collapsible-up": "collapsible-up 0.2s ease-in-out",
      },
    },
  },
  plugins: [animate],
};

export default config;

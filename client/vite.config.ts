import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";
import { SEO_ROUTES } from "./scripts/seo-routes.mjs";

const buildDate = process.env.BUILD_DATE ?? new Date().toISOString().slice(0, 10);

function getNodeModulePackageName(id: string): string | null {
  const [, modulePath] = id.split("node_modules/");
  if (!modulePath) return null;

  const segments = modulePath.split("/");
  if (segments[0]?.startsWith("@")) {
    return segments.slice(0, 2).join("/");
  }

  return segments[0] ?? null;
}

const UI_PACKAGES = new Set([
  "radix-vue",
  "lucide-vue-next",
  "@floating-ui/core",
  "@floating-ui/dom",
  "@floating-ui/vue",
  "vue-demi",
]);

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  base: "/car/",
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_ID__: JSON.stringify("car-calculator"),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  server: {
    port: 6106,
  },
  esbuild:
    process.env.NODE_ENV === "production"
      ? { drop: ["console", "debugger"] }
      : {},
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          const packageName = getNodeModulePackageName(id);
          if (!packageName) return;

          if (UI_PACKAGES.has(packageName)) {
            return "ui";
          }

          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  ssgOptions: {
    includedRoutes() {
      return SEO_ROUTES;
    },
  },
});

import { nextTick } from "vue";
import type { Router, RouteRecordRaw } from "vue-router";
import { trackPageView } from "@/lib/analytics";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/tax",
  },
  {
    path: "/tax",
    name: "CarTax",
    component: () => import("@/views/CarTaxView.vue"),
  },
  {
    path: "/tax/:amount(\\d+)",
    name: "CarTaxAmount",
    component: () => import("@/views/CarTaxView.vue"),
    props: (route) => ({ initialVehiclePrice: Number(route.params.amount) * 10000 }),
  },
  {
    path: "/insurance",
    name: "Insurance",
    component: () => import("@/views/InsuranceView.vue"),
  },
  {
    path: "/insurance/:amount(\\d+)",
    name: "InsuranceAmount",
    component: () => import("@/views/InsuranceView.vue"),
    props: (route) => ({ initialPremium: Number(route.params.amount) * 10000 }),
  },
  {
    path: "/lease-vs-loan",
    name: "LeaseVsLoan",
    component: () => import("@/views/LeaseVsLoanView.vue"),
  },
  {
    path: "/lease-vs-loan/:amount(\\d+)",
    name: "LeaseVsLoanAmount",
    component: () => import("@/views/LeaseVsLoanView.vue"),
    props: (route) => ({ initialVehiclePrice: Number(route.params.amount) * 10000 }),
  },
  {
    path: "/parking",
    name: "Parking",
    component: () => import("@/views/ParkingView.vue"),
  },
  {
    path: "/maintenance",
    name: "Maintenance",
    component: () => import("@/views/MaintenanceView.vue"),
  },
  {
    path: "/ev-vs-gas",
    name: "EvVsGas",
    component: () => import("@/views/EvVsGasView.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
  },
  {
    path: "/terms",
    name: "Terms",
    component: () => import("@/views/TermsView.vue"),
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/PrivacyView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function createScrollBehavior(): Router["options"]["scrollBehavior"] {
  return (to, from, savedPosition) => {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 80 };
    if (to.path === from.path) return false;
    return { top: 0 };
  };
}

export function setupRouterGuards(router: Router): void {
  router.afterEach((to, _from, failure) => {
    if (failure || !isBrowser()) return;
    void nextTick(() => {
      trackPageView(to.fullPath, document.title);
    });
  });
}

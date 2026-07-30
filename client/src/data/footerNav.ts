import type { SiteFooterLink, SiteFooterSection } from "@shakilabs/ui";

/** 푸터 계산기 목록 — 라우터의 실제 경로만 담는다(리다이렉트 별칭 제외) */
export const FOOTER_SECTIONS: readonly SiteFooterSection[] = [
  {
    title: "세금·보험",
    links: [
    { to: "/tax", label: "자동차 취등록세" },
    { to: "/insurance", label: "자동차보험 절약" },
    ],
  },
  {
    title: "구매·유지",
    links: [
    { to: "/lease-vs-loan", label: "리스·할부·렌트" },
    { to: "/maintenance", label: "차량 유지비" },
    { to: "/parking", label: "주차비 비교" },
    { to: "/ev-vs-gas", label: "전기차·내연기관" },
    ],
  },
];

export const FOOTER_ALL_LINK: SiteFooterLink = {
  to: "/all",
  label: "전체 계산기 보기 →",
};

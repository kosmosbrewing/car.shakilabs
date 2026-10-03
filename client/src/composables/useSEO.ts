import { useHead } from "@unhead/vue";
import { toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { getSiteUrl } from "@/lib/site";

// 함대 제목 레시피(2026-10-03 개정) — 페이지 종류에 따라 두 모양으로 나뉜다.
// - "tool"(기본, 계산기·도구): `<페이지 제목> | ShakiLabs`
//   유입의 거의 전부인 네이버 검색 결과는 제목을 약 35자에서 자르는데, 옛 중간
//   배지(" | 자동차 비교 계산기 | ShakiLabs", 16자)가 그 자리를 먹어 핵심 구절과
//   브랜드가 잘려 보였다.
// - "site"(허브(/all)·소개·이용약관·개인정보처리방침·404): `<페이지 제목> · <앱 이름> | ShakiLabs`
//   앱 이름까지 빼면 "이용약관 | ShakiLabs"가 shakilabs.com 아래 12개 앱에서 똑같아져
//   도메인 안 중복 제목이 된다. 이 페이지들은 검색 유입이 목적이 아니라 35자 절단이
//   문제되지 않는다.
// 홈은 어느 쪽이든 `<앱 이름> | ShakiLabs`(뷰가 APP_NAME을 그대로 title로 넘긴다).
export const APP_NAME = "자동차 비교 계산기";
const TITLE_SUFFIX = " | ShakiLabs";
const SITE_APP_SUFFIX = ` · ${APP_NAME}`;
export type TitleKind = "tool" | "site";
// 호출부가 옛·현행 접미사를 그대로 넘겨도 두 번 붙지 않게 벗겨 낸다.
// 긴 것부터 검사해야 " | ShakiLabs"만 먼저 벗겨지고 앱 이름이 남는 일이 없다.
const LEGACY_TITLE_SUFFIXES = [
  `${SITE_APP_SUFFIX}${TITLE_SUFFIX}`,
  ` | ${APP_NAME} | ShakiLabs`,
  ` | ${APP_NAME}`,
  SITE_APP_SUFFIX,
  " | shakilabs",
  TITLE_SUFFIX,
] as const;

type SEOOptions = {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  ogImage?: MaybeRefOrGetter<string | undefined>;
  noindex?: MaybeRefOrGetter<boolean | undefined>;
  /** 기본 "tool". 허브(/all)·소개·약관·개인정보·404만 "site"로 넘긴다(위 레시피 주석 참고). */
  titleKind?: MaybeRefOrGetter<TitleKind | undefined>;
  jsonLd?: MaybeRefOrGetter<
    Record<string, unknown> | Record<string, unknown>[] | undefined
  >;
  /**
   * Overrides the path used for canonical / hreflang / og:url.
   * Amount-variant routes (e.g. /tax/2000) pass their base page ("/tax")
   * because the prerendered body is identical across variants — canonical
   * consolidation instead of noindex, so ranking signals merge into the base.
   */
  canonicalPath?: MaybeRefOrGetter<string | undefined>;
};

/** 문서 제목·og:title·twitter:title이 모두 이 함수 하나를 거친다 — 레시피를 두 곳에 적지 않는다. */
export function buildPageTitle(rawTitle: string, kind: TitleKind = "tool"): string {
  const trimmed = rawTitle.trim();
  let baseTitle = trimmed;

  for (const suffix of LEGACY_TITLE_SUFFIXES) {
    if (baseTitle.endsWith(suffix)) {
      baseTitle = baseTitle.slice(0, -suffix.length).trimEnd();
      break;
    }
  }

  // 뷰가 넘기는 title에 이미 "|"가 들어있으면(서브타이틀 병기) 중점으로 바꾼다 —
  // 그대로 두면 끝에 붙는 " | ShakiLabs"와 합쳐져 "|"가 두 번 나와 어디까지가
  // 페이지 이름인지 읽히지 않는다. 부제는 검색 키워드를 담고 있으므로 버리지 않는다.
  baseTitle = baseTitle.replace(/\s*\|\s*/g, " · ");

  if (!baseTitle || baseTitle === APP_NAME) {
    return `${APP_NAME}${TITLE_SUFFIX}`;
  }

  return kind === "site"
    ? `${baseTitle}${SITE_APP_SUFFIX}${TITLE_SUFFIX}`
    : `${baseTitle}${TITLE_SUFFIX}`;
}

export function useSEO({
  title,
  description,
  ogImage,
  noindex = false,
  titleKind,
  jsonLd,
  canonicalPath,
}: SEOOptions): void {
  const route = useRoute();

  useHead(() => {
    const resolvedTitle = buildPageTitle(toValue(title), toValue(titleKind) ?? "tool");
    const resolvedDescription = toValue(description);
    const resolvedNoindex = Boolean(toValue(noindex));
    const resolvedOgImage = toValue(ogImage);
    const resolvedJsonLd = toValue(jsonLd);
    const resolvedJsonLdArray = Array.isArray(resolvedJsonLd)
      ? resolvedJsonLd.filter(
          (entry): entry is Record<string, unknown> =>
            Boolean(entry) && typeof entry === "object"
        )
      : resolvedJsonLd && typeof resolvedJsonLd === "object"
        ? [resolvedJsonLd]
        : [];
    const siteUrl = getSiteUrl().replace(/\/+$/, "");
    // canonical/hreflang/og:url must always agree, so they all derive from
    // the same resolved path (override first, route path otherwise).
    const resolvedCanonicalPath = toValue(canonicalPath);
    const currentPath = resolvedCanonicalPath || route.path || "/";
    const currentUrl = currentPath === "/" ? siteUrl : `${siteUrl}${currentPath}`;

    return {
      htmlAttrs: {
        lang: "ko",
      },
      title: resolvedTitle,
      link: currentUrl
        ? [
            { rel: "canonical", href: currentUrl },
            { rel: "alternate", hreflang: "ko", href: currentUrl },
            { rel: "alternate", hreflang: "x-default", href: currentUrl },
          ]
        : [],
      meta: [
        { name: "description", content: resolvedDescription },
        { property: "og:title", content: resolvedTitle },
        { property: "og:description", content: resolvedDescription },
        { name: "twitter:title", content: resolvedTitle },
        { name: "twitter:description", content: resolvedDescription },
        ...(currentUrl ? [{ property: "og:url", content: currentUrl }] : []),
        ...(resolvedNoindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
        ...(resolvedOgImage
          ? [
              { property: "og:image", content: resolvedOgImage },
              { name: "twitter:image", content: resolvedOgImage },
            ]
          : []),
      ],
      script: resolvedJsonLdArray.map((entry, index) => ({
        key: `json-ld-${index}`,
        type: "application/ld+json",
        textContent: JSON.stringify(entry),
      })),
    };
  });
}

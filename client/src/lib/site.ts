export const DEFAULT_SITE_URL = "https://shakilabs.com/car";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizeSiteUrl(value: string | null | undefined): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return null;

  try {
    return trimTrailingSlash(new URL(trimmed).toString());
  } catch {
    return null;
  }
}

export function getCanonicalSiteUrl(): string {
  const envSiteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL);
  return envSiteUrl ?? DEFAULT_SITE_URL;
}

export function getSiteUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    // origin만 반환하므로 base path를 붙여야 함
    const basePath = new URL(getCanonicalSiteUrl()).pathname.replace(/\/+$/, "");
    return trimTrailingSlash(`${window.location.origin}${basePath}`);
  }

  return getCanonicalSiteUrl();
}

export function getCanonicalHost(): string {
  return new URL(getCanonicalSiteUrl()).hostname;
}

export function getKakaoAllowedHosts(): string[] {
  const configured = ((import.meta.env.VITE_KAKAO_ALLOWED_HOSTS as string | undefined) || "")
    .split(",")
    .map((value: string) => value.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(configured.length ? configured : [getCanonicalHost()]));
}

export function isAllowedKakaoHost(hostname: string | null | undefined): boolean {
  const normalized = typeof hostname === "string" ? hostname.trim().toLowerCase() : "";
  if (!normalized) return false;
  return getKakaoAllowedHosts().includes(normalized);
}

export function buildCanonicalUrl(path: string, queryString = "", hash = ""): string {
  const baseUrl = new URL(getCanonicalSiteUrl());
  // base path(예: /car)를 보존하면서 route path를 이어붙임
  const basePath = baseUrl.pathname.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  baseUrl.pathname = `${basePath}${normalizedPath}`;
  baseUrl.search = queryString ? `?${queryString.replace(/^\?/, "")}` : "";
  baseUrl.hash = hash ? `#${hash.replace(/^#/, "")}` : "";
  return baseUrl.toString();
}

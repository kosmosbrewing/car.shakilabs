export type AffiliateItem = {
  label: string;
  href: string;
  description: string;
};

export const AFFILIATE_DISCLOSURE_TEXT =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

function buildAffiliateItem(label: string, rawHref: string | undefined, description: string): AffiliateItem | null {
  const href = rawHref?.trim();
  if (!href) return null;

  return { label, href, description };
}

const maybeCarAffiliateItems = [
  buildAffiliateItem(
    "블랙박스",
    import.meta.env.VITE_COUPANG_BLACKBOX_URL,
    "보험료 절약 계산과 함께 많이 찾는 차량 안전용품입니다."
  ),
  buildAffiliateItem(
    "세차용품",
    import.meta.env.VITE_COUPANG_CAR_WASH_URL,
    "차량 유지비를 줄일 때 같이 보는 셀프 관리 상품입니다."
  ),
];

export const carAffiliateItems = maybeCarAffiliateItems.filter((item): item is AffiliateItem => item !== null);

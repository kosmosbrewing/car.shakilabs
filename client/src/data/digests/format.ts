// 파생 다이제스트 공용 포매터.
//
// 다이제스트 산문의 숫자는 전부 엔진 실행값이라, 문장 안에서 숫자를 손으로 적는 일이 없어야 한다.
// 여기 함수만 거치게 하면 "계산기는 2,269,000원인데 산문은 226만원" 같은 드리프트가 생길 수 없다.
// 금리·주행거리·요금처럼 사용자가 고르는 값은 사실이 아니라 파라미터라, 산문에서 "가정"이라고 밝힌다.

export interface Finding {
  /** SeoRichGuide가 h3로 렌더한다. 결론을 그대로 담은 한 줄이어야 스캔이 된다. */
  h2: string;
  body: string;
}

export function won(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

/** km당 비용처럼 1원 미만이 의미 있는 값 — 39.5원 */
export function wonAt(value: number, digits = 1): string {
  return `${Number(value.toFixed(digits)).toLocaleString("ko-KR")}원`;
}

/** 1,020,000 → "102만원", 30,000,000 → "3,000만원", 100,000,000 → "1억원" */
export function manwon(value: number): string {
  const sign = value < 0 ? "-" : "";
  const man = Math.round(Math.abs(value) / 10_000);
  if (man < 10_000) return `${sign}${man.toLocaleString("ko-KR")}만원`;
  const eok = Math.floor(man / 10_000);
  const rest = man % 10_000;
  return rest === 0 ? `${sign}${eok}억원` : `${sign}${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
}

/** 0.07 같은 비율 → "7%" */
export function pct(ratio: number, digits = 1): string {
  return `${Number((ratio * 100).toFixed(digits)).toString()}%`;
}

/** 비율 차이는 %가 아니라 %p — "12%와 22%의 차이 10%"로 읽히면 오독이다. */
export function pp(diffInPercentPoints: number, digits = 1): string {
  return `${Number(diffInPercentPoints.toFixed(digits)).toString()}%p`;
}

export function times(a: number, b: number, digits = 1): string {
  return `${(a / b).toFixed(digits)}배`;
}

export function num(value: number, digits = 0): string {
  return Number(value.toFixed(digits)).toLocaleString("ko-KR");
}

/** 15000 → "15,000km" */
export function km(value: number): string {
  return `${num(value)}km`;
}

/** 24 → "2년", 36 → "3년", 30 → "2년 6개월" */
export function term(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}개월`;
  return m === 0 ? `${y}년` : `${y}년 ${m}개월`;
}

// 숫자 포매터 뒤에 붙는 조사 — "원"(받침 ㄴ)·"%"·"km"·"배"가 섞이므로 고정 조사를 쓰면 "원로"가 된다.
function hasFinalConsonant(word: string): boolean {
  const last = word.charCodeAt(word.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  return isHangul && (last - 0xac00) % 28 !== 0;
}
function finalIsRieul(word: string): boolean {
  const last = word.charCodeAt(word.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  return isHangul && (last - 0xac00) % 28 === 8;
}
/** 은/는 */
export function eun(word: string): string { return `${word}${hasFinalConsonant(word) ? "은" : "는"}`; }
/** 을/를 */
export function eul(word: string): string { return `${word}${hasFinalConsonant(word) ? "을" : "를"}`; }
/** 이/가 */
export function ga(word: string): string { return `${word}${hasFinalConsonant(word) ? "이" : "가"}`; }
/** (으)로 */
export function ro(word: string): string { return `${word}${hasFinalConsonant(word) && !finalIsRieul(word) ? "으로" : "로"}`; }
/** 와/과 */
export function wa(word: string): string { return `${word}${hasFinalConsonant(word) ? "과" : "와"}`; }
/** (이)다 — 결론형 h3의 종결에 쓴다 */
export function ida(word: string): string { return `${word}${hasFinalConsonant(word) ? "이다" : "다"}`; }

/**
 * 키워드 → ValueChain sector 매핑
 * (필요 시 계속 확장)
 */
export const keywordToSectorMap: Record<string, string[]> = {
  반도체: ["설계", "제조", "패키징", "검사"],
  인공지능: ["반도체", "전력"],
  로봇: ["자동화"],
  배터리: ["전기", "발전"],
};

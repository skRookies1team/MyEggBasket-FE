import type { ValueChainNode, ValueChainStock } from "../../types/valueChain";
import { keywordToSectorMap } from "./keywordToSectorMap";

/**
 * 키워드 → 종목 코드 추출
 */
export function findStocksByKeyword(
  keyword: string,
  valueChain: ValueChainNode[]
): ValueChainStock[] {
  const sectors = keywordToSectorMap[keyword] ?? [keyword];

  return valueChain
    .filter((v) => sectors.includes(v.sector))
    .flatMap((v) => v.stocks);
}

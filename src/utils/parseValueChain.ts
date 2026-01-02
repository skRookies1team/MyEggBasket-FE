// utils/parseValueChain.ts
import type { ValueChainStock } from "../types/valueChain";

export function parseStockCodes(
  raw: string,
  sector: string,
  stage: string
): ValueChainStock[] {
  if (!raw) return [];

  return raw
    .split(",")
    .map((item) => {
      const match = item.trim().match(/(.+?)\s*\((\d+)\)/);
      if (!match) return null;

      return {
        sector,
        stage,
        stockName: match[1].trim(),
        stockCode: match[2],
      };
    })
    .filter(Boolean) as ValueChainStock[];
}

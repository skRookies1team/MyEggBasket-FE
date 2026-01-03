// hooks/useValueChain.ts
import { useEffect, useState } from "react";
import Papa from "papaparse";
import type { ValueChainRow, ValueChainStock } from "../types/valueChain";
import { parseStockCodes } from "../utils/parseValueChain";

export function useValueChain(sectorName: string | null) {
  const [stocks, setStocks] = useState<ValueChainStock[]>([]);

  useEffect(() => {
    if (!sectorName) return;

    Papa.parse<ValueChainRow>("/data/value_chain.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.filter(
          (row) => row.sector?.trim() === sectorName.trim()
        );

        const parsed = rows.flatMap((row) => {
          const stage =
            row.stage3 || row.stage2 || row.stage1 || "기타";

          return parseStockCodes(
            row.stockCode,
            row.sector,
            stage
          );
        });

        setStocks(parsed);
      },
    });
  }, [sectorName]);

  return stocks;
}

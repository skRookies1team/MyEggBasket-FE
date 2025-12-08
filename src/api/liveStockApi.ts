// src/api/liveStockService.ts
import { fetchHistoricalData, getStockInfoFromDB, getAccessToken } from "./stockApi";
import type { StockItem } from "../types/stock";

/** 1개 종목 + 1기간 snapshot 생성 */
async function getSnapshotFromHistory(
  stockCode: string,
  period: "day" | "week" | "month" | "year",
  token: string
): Promise<StockItem | null> {
  const history = await fetchHistoricalData(stockCode, period, token);
  if (!history || history.length < 2) return null;

  const last = history[history.length - 1];
  const prev = history[history.length - 2];

  const change = last.price - prev.price;
  const percent = prev.price ? (change / prev.price) * 100 : 0;

  const info = await getStockInfoFromDB(stockCode);
  const amount = last.price * last.volume;

  return {
    code: stockCode,
    name: info?.name ?? stockCode,
    price: last.price,
    change: Number(change.toFixed(2)),
    percent: Number(percent.toFixed(2)),
    volume: last.volume,
    amount,
  };
}

/** 지정된 종목 리스트 snapshot 생성 */
async function getSnapshots(
  tickers: string[],
  period: "day" | "week" | "month" | "year",
  token: string
): Promise<StockItem[]> {
  const tasks = tickers.map((code) =>
    getSnapshotFromHistory(code, period, token)
  );

  const results = await Promise.all(tasks);

  return results.filter((x): x is StockItem => x !== null);
}

/** tickers × 1기간 → 정렬별 리스트 4개 생성 */
export async function fetch50StocksByPeriod(
  period: "day" | "week" | "month" | "year",
  tickers: string[]
) {
  const token = await getAccessToken();
  const snapshots = await getSnapshots(tickers, period, token);

  return {
    volume: [...snapshots].sort((a, b) => b.volume - a.volume),
    amount: [...snapshots].sort((a, b) => b.amount - a.amount),
    rise:   [...snapshots].sort((a, b) => b.percent - a.percent),
    fall:   [...snapshots].sort((a, b) => a.percent - b.percent),
  };
}

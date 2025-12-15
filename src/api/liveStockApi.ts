import { fetchHistoricalData, getStockInfoFromDB } from "./stocksApi";
import type { StockCurrentPrice, StockItem } from "../types/stock";
import api from "../store/axiosStore";

/** 1개 종목 + 1기간 snapshot 생성 */
async function getSnapshotFromHistory(
  stockCode: string,
  period: "day" | "week" | "month" | "year"
): Promise<StockItem | null> {

  const history = await fetchHistoricalData(stockCode, period);
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

/** 50개 종목 snapshot (chunk 처리만 유지) */
async function getSnapshots(
  tickers: string[],
  period: "day" | "week" | "month" | "year"
): Promise<StockItem[]> {

  const results: StockItem[] = [];
  const chunkSize = 10; // 프런트 부하 분산용

  for (let i = 0; i < tickers.length; i += chunkSize) {
    const batch = tickers.slice(i, i + chunkSize);

    const batchResults = await Promise.all(
      batch.map((code) => getSnapshotFromHistory(code, period))
    );

    results.push(...batchResults.filter((x): x is StockItem => x !== null));

    // 너무 빠른 연속 요청 방지 
    await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}

/** tickers × 1기간 → 정렬된 리스트 4개 생성 */
export async function fetch50StocksByPeriod(
  period: "day" | "week" | "month" | "year",
  tickers: string[]
) {
  const snapshots = await getSnapshots(tickers, period);

  return {
    volume: [...snapshots].sort((a, b) => b.volume - a.volume),
    amount: [...snapshots].sort((a, b) => b.amount - a.amount),
    rise: [...snapshots].sort((a, b) => b.percent - a.percent),
    fall: [...snapshots].sort((a, b) => a.percent - b.percent),
  };
}

/** 현재가 조회 */
export async function fetchStockCurrentPrice(stockCode: string) {
  try {
    const response = await api.get<StockCurrentPrice>(
      `/kis/stock/current-price/${stockCode}?useVirtualServer=false`
    );
    return response.data;
  } catch (err) {
    console.error("주식 정보를 불러오는 중 오류:", err);
    return null;
  }
}

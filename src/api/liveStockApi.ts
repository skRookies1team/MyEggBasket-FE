import { fetchHistoricalData, getStockInfoFromDB } from "./stocksApi";
import type { Period, StockCandle, StockCurrentPrice, StockItem } from "../types/stock";
import api from "../store/axiosStore";

/** ============================================================
 *  1개 종목 + 1기간 snapshot 생성
 * ============================================================ */
async function getSnapshotFromHistory(
  stockCode: string,
  period: Period
): Promise<StockItem | null> {

  const history: StockCandle[] = await fetchHistoricalData(stockCode, period);
  if (!history || history.length < 2) return null;

  // 시간 기준 오름차순 정렬
  const sorted = [...history].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const last = sorted.at(-1)!; // 최신
  const prev = sorted.at(-2)!; // 직전

  // ✅ 종가(close) 기준
  const change = last.close - prev.close;
  const percent = prev.close ? (change / prev.close) * 100 : 0;

  const info = await getStockInfoFromDB(stockCode);
  const amount = last.close * last.volume;

  return {
    code: stockCode,
    name: info?.name ?? stockCode,
    price: last.close, // UI용 현재가 = 종가
    change: Number(change.toFixed(2)),
    percent: Number(percent.toFixed(2)),
    volume: last.volume,
    amount,
  };
}

/** ============================================================
 *  50개 종목 snapshot (chunk 처리 유지)
 * ============================================================ */
async function getSnapshots(
  tickers: string[],
  period: Period
): Promise<StockItem[]> {

  const results: StockItem[] = [];
  const chunkSize = 10;

  for (let i = 0; i < tickers.length; i += chunkSize) {
    const batch = tickers.slice(i, i + chunkSize);

    const batchResults = await Promise.all(
      batch.map((code) => getSnapshotFromHistory(code, period))
    );

    results.push(...batchResults.filter((x): x is StockItem => x !== null));

    // 요청 간 간격
    await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}

/** ============================================================
 *  tickers × 1기간 → 정렬된 리스트 4개 생성
 * ============================================================ */
export async function fetch50StocksByPeriod(
  period: Period,
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

/** ============================================================
 *  현재가 조회
 * ============================================================ */
export async function fetchStockCurrentPrice(
  stockCode: string
): Promise<StockCurrentPrice | null> {
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

import api from "../store/axiosStore";
import type { Period, StockCandle } from "../types/stock";

/* ============================================================
    KIS 기간별 시세 조회 (day / week / month / year)
============================================================ */
interface KisPeriodStockData {
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface KisPeriodStockResponse {
  stockCode: string;
  period: Period;
  data: KisPeriodStockData[];
}

export async function fetchHistoricalData(
    stockCode: string,
    period: Period
): Promise<StockCandle[]> {
  try {
    const res = await api.get<KisPeriodStockResponse>(
        `/kis/chart/${stockCode}`,
        { params: { period } }
    );

    return res.data.data.map((item) => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.price,
      volume: item.volume,
    }));
  } catch (error) {
    console.error("차트 데이터 조회 실패", error);
    return [];
  }
}

/* ============================================================
   단일 종목 상세 정보 조회 (DB)
============================================================ */
export interface StockSearchResult {
  stockCode: string;
  name: string;
  marketType: string;
  corpCode: string;
  sector: string;
  industryCode: string;
}

export async function getStockInfoFromDB(
    code: string
): Promise<StockSearchResult | null> {
  try {
    const res = await api.get<StockSearchResult>(`/stocks/${code}`);
    return res.data;
  } catch (error) {
    console.error("종목 DB 조회 실패", error);
    return null;
  }
}

export async function searchStocks(
    keyword: string
): Promise<StockSearchResult[]> {
  try {
    if (!keyword.trim()) return [];

    const res = await api.get<StockSearchResult[]>(
        "/stocks/search",
        { params: { keyword } }
    );
    return res.data;
  } catch (error) {
    console.error("종목 검색 실패", error);
    return [];
  }
}

/* ============================================================
   [추가] 종목 구독 (INTEREST / VIEW) API + 로그
============================================================ */
export const stockSubscriptionApi = {
  subscribe: async (data: { stockCode: string; type: string }) => {
    console.log(`[API] 📡 Sending POST /subscriptions | stockCode: ${data.stockCode}, type: ${data.type}`);

    // axiosStore의 baseURL이 '/api/app'이라면 '/subscriptions'로 요청
    const response = await api.post("/subscriptions", data);

    console.log(`[API] ✅ Response: ${response.status}`, response.data);
    return response;
  },
};
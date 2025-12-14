import api from "../store/axiosStore";
import type { StockPriceData } from "../types/stock";

/* ============================================================
    KIS 기간별 시세 조회
============================================================ */

interface KisChartData {
  time: string;
  price: number;
  volume: number;
}

interface KisChartResponse {
  stockCode: string;
  period: "day" | "week" | "month" | "year";
  data: KisChartData[];
}

interface StockSearchResult {
    stockCode: string;
    name: string;
    marketType: string;
    sector: string;
    industryCode: string;
}

export async function fetchHistoricalData(
  stockCode: string,
  period: "day" | "week" | "month" | "year"
): Promise<StockPriceData[]> {
  try {
    const res = await api.get<KisChartResponse>(
      `/kis/chart/${stockCode}`,
      { params: { period } }
    );

    return res.data.data.map((item) => ({
      time: item.time,
      price: item.price,
      volume: item.volume,
    }));
  } catch (error) {
    console.error("📉 차트 데이터 조회 실패", error);
    return [];
  }
}

/* ============================================================
   단일 종목 상세 정보 조회 (DB)
============================================================ */

export async function getStockInfoFromDB(
  code: string
): Promise<StockSearchResult | null> {
  try {
    const res = await api.get<StockSearchResult>(`/stocks/${code}`);
    return res.data;
  } catch (error) {
    console.error(" 종목 DB 조회 실패", error);
    return null;
  }
}

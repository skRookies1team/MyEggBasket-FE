import api from "../store/axiosStore";
import type { Stock, StockPriceData } from "../types/stock";

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
  period: "day" | "week" | "month" | "year";
  data: KisPeriodStockData[];
}

export async function fetchHistoricalData(
  stockCode: string,
  period: "day" | "week" | "month" | "year"
): Promise<StockPriceData[]> {
  try {
    const res = await api.get<KisPeriodStockResponse>(
      `/kis/chart/${stockCode}`,
      { params: { period } }
    );

    return res.data.data.map((item) => ({
      time: item.time,
      price: item.price,
      open: item.open,
      high: item.high,
      low: item.low,
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

interface StockSearchResult {
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
    console.error(" 종목 DB 조회 실패", error);
    return null;
  }
}


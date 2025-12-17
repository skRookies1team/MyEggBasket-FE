import api from "../store/axiosStore";
import type { Period, StockCandle } from "../types/stock";

/* ============================================================
    KIS 기간별 시세 조회 (day / week / month / year)
============================================================ */

/** KIS API 응답 전용 타입 (외부 노출 ❌) */
interface KisPeriodStockData {
  time: string;
  price: number; // 종가
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

    // API → 도메인 변환 (여기서만)
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

interface StockSearchResult {
  stockCode: string;
  name: string;
  marketType: string;
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

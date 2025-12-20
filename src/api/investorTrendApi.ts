import api from "../store/axiosStore";
import type { InvestorTrendResponse } from "../types/stock";

// 단일 종목 
export async function fetchInvestorTrend(
  stockCode: string
): Promise<InvestorTrendResponse> {
  const res = await api.get(
    `/kis/investor-trend/${stockCode}`
  );
  return res.data;
}

// 시장 / 주요 종목
export async function fetchMarketInvestorTrend()
  : Promise<InvestorTrendResponse[]> {

  const res = await api.get(
    "/kis/investor-trend/market"
  );
  return res.data;
}

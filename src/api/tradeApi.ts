import api from "../store/axiosStore";
import type { KisStockOrderRequest, KisStockOrderResponse } from "../types/trade.ts";
import type { TradeHistoryItem } from "../store/orderStore";

/** 매수/매도 주문 */
export async function orderStock(
  payload: KisStockOrderRequest,
  virtual: boolean = false
): Promise<KisStockOrderResponse> {
  const res = await api.post<KisStockOrderResponse>(
    `/kis/trade?virtual=${virtual}`,
    payload
  );
  return res.data;
}


/**
 * 거래/주문 내역 조회
 * @param status optional (ex: COMPLETED, PENDING 등)
 * @param virtual 모의/실전
 */
export async function fetchTradeHistory(
  status?: string,
  virtual: boolean = false
): Promise<TradeHistoryItem[]> {
  const res = await api.get<TradeHistoryItem[]>(
    `/kis/trade/history`,
    {
      params: {
        status,
        virtual,
      },
    }
  );

  return res.data;
}
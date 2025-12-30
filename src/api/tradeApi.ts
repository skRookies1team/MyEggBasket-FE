// src/api/tradeApi.ts
import api from "../store/axiosStore";
import type {
  KisStockOrderRequest,
  KisStockLimitPriceOrderRequest,
  KisStockOrderResponse,
} from "../types/trade";

/**
 * 시장가 / 일반 주문
 * → KisStockOrderRequest
 */
export async function orderStock(
  payload: KisStockOrderRequest,
  virtual = false
): Promise<KisStockOrderResponse> {
  const res = await api.post<KisStockOrderResponse>(
    "/kis/trade",
    payload,
    {
      params: { virtual },
    }
  );
  return res.data;
}

/**
 * 지정가 주문 (LIMIT)
 * → KisStockLimitPriceOrderRequest
 */
export async function orderStockWithLimitPrice(
  payload: KisStockLimitPriceOrderRequest,
  virtual = false
): Promise<KisStockOrderResponse> {
  const res = await api.post<KisStockOrderResponse>(
    "/kis/trade/limit-price",
    payload,
    {
      params: { virtual },
    }
  );
  return res.data;
}

/**
 * 거래 내역 조회
 */
export async function fetchTradeHistory(
  status?: string,
  virtual = false
) {
  const res = await api.get("/kis/trade/history", {
    params: {
      virtual,
      status,
    },
  });
  return res.data;
}

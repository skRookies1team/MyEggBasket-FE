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

// export async function fetchTradeHistory(
//   status?: string,
//   virtual = false
// ) {
//   const data =
//     [
//       {
//         "transactionId": 1,
//         "stockCode": "044380",
//         "stockName": "주연테크",
//         "type": "BUY",
//         "typeDescription": "매수",
//         "status": "COMPLETED",
//         "statusDescription": "체결",
//         "quantity": 1,
//         "price": 448,
//         "portfolioId": 2,
//         "totalPrice": 448,
//         "triggerSource": null,
//         "triggerSourceName": null,
//         "executedAt": "2025-12-05T14:21:04"
//       },
//       {
//         "transactionId": 2,
//         "stockCode": "004410",
//         "stockName": "서울식품",
//         "type": "SELL",
//         "typeDescription": "매도",
//         "status": "COMPLETED",
//         "statusDescription": "체결",
//         "quantity": 1,
//         "portfolioId": 2,
//         "price": 153,
//         "totalPrice": 153,
//         "triggerSource": null,
//         "triggerSourceName": null,
//         "executedAt": "2025-12-03T13:08:19"
//       },
//       {
//         "transactionId": 3,
//         "stockCode": "004410",
//         "stockName": "서울식품",
//         "type": "BUY",
//         "typeDescription": "매수",
//         "status": "COMPLETED",
//         "statusDescription": "체결",
//         "quantity": 1,
//         "portfolioId": 2,
//         "price": 154,
//         "totalPrice": 154,
//         "triggerSource": null,
//         "triggerSourceName": null,
//         "executedAt": "2025-12-03T13:06:26"
//       }
//     ]
//     return data
// }
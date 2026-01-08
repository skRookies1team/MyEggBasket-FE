export type OrderType = "BUY" | "SELL";
export type TriggerSource = "MANUAL" | "AI";

export interface KisStockOrderRequest {
  stockCode: string;
  orderType: OrderType;
  quantity: number;
  price: number;
  triggerSource: TriggerSource;
}

export interface KisStockLimitPriceOrderRequest {
  stockCode: string;
  orderType: OrderType;
  quantity: number;
  limitPrice: number;
  triggerSource: TriggerSource;
}

export interface KisStockOrderResponse {
  orderId: string;
  stockCode: string;
  orderType: OrderType;
  quantity: number;
  price: number;
  status: string; // REQUESTED, FILLED 등
  message?: string;
}

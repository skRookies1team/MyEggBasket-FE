// src/components/stock/chart/OrderPanel.tsx
import { useState } from "react";

import { StockOrderBook } from "../StockOrderBook";
import { orderStock } from "../../../api/tradeApi";

import type { OrderBookData } from "../../../types/stock";
import type {
  KisStockOrderRequest,
  OrderType,
} from "../../../types/trade";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface OrderPanelProps {
  stockCode: string;
  currentPrice: number;
  orderBook: OrderBookData | null;
  virtual?: boolean; // 모의/실전
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function OrderPanel({
  stockCode,
  currentPrice,
  orderBook,
  virtual = false,
}: OrderPanelProps) {
  /* ------------------ order state ------------------ */
  const [orderType, setOrderType] = useState<OrderType>("BUY");
  const [price, setPrice] = useState<number>(currentPrice);
  const [quantity, setQuantity] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------ handlers ------------------ */
  const handleOrder = async () => {
    setError(null);

    if (price <= 0 || quantity <= 0) {
      setError("가격과 수량을 확인하세요.");
      return;
    }

    const payload: KisStockOrderRequest = {
      stockCode,
      orderType,
      quantity,
      price,
      triggerSource: "MANUAL",
    };

    try {
      setLoading(true);
      await orderStock(payload, virtual);

      alert(
        `${orderType === "BUY" ? "매수" : "매도"} 주문이 접수되었습니다.`
      );
    } catch (e) {
      console.error(e);
      setError("주문 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ render ------------------ */
  return (
    <div className="flex h-full flex-col gap-4">
      {/* ===================== */}
      {/* OrderBook */}
      {/* ===================== */}
      {orderBook ? (
        <StockOrderBook
          stockCode={stockCode}
          orderBook={orderBook}
          currentPrice={currentPrice}
          onSelectPrice={setPrice}
        />
      ) : (
        <div className="flex h-[300px] items-center justify-center rounded-xl bg-[#0f0f17] text-sm text-gray-400">
          호가 데이터를 불러오는 중입니다.
        </div>
      )}

      {/* ===================== */}
      {/* Order Controls */}
      {/* ===================== */}
      <div className="rounded-xl bg-[#0f0f17] p-4">
        {/* Buy / Sell Toggle */}
        <div className="mb-4 flex rounded-lg bg-black/30 p-1">
          <button
            onClick={() => setOrderType("BUY")}
            className={`
              flex-1 rounded-md py-1.5 text-sm font-semibold transition
              ${
                orderType === "BUY"
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-gray-400 hover:text-gray-200"
              }
            `}
          >
            매수
          </button>
          <button
            onClick={() => setOrderType("SELL")}
            className={`
              flex-1 rounded-md py-1.5 text-sm font-semibold transition
              ${
                orderType === "SELL"
                  ? "bg-red-500/20 text-red-300"
                  : "text-gray-400 hover:text-gray-200"
              }
            `}
          >
            매도
          </button>
        </div>

        {/* Price */}
        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-400">가격</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="
              w-full rounded-md bg-black/30
              px-3 py-2 text-sm text-gray-100
              outline-none ring-1 ring-[#232332]
              focus:ring-indigo-500
            "
          />
        </div>

        {/* Quantity */}
        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-400">수량</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="
              w-full rounded-md bg-black/30
              px-3 py-2 text-sm text-gray-100
              outline-none ring-1 ring-[#232332]
              focus:ring-indigo-500
            "
          />
        </div>

        {/* Summary */}
        <div className="mb-3 text-right text-sm text-gray-300">
          총 금액:{" "}
          <span className="font-semibold text-gray-100">
            {(price * quantity).toLocaleString()}원
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleOrder}
          disabled={loading}
          className={`
            w-full rounded-lg py-2.5 text-sm font-semibold transition
            ${
              orderType === "BUY"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-red-500 text-white hover:bg-red-600"
            }
            disabled:opacity-60
          `}
        >
          {loading
            ? "주문 처리 중..."
            : orderType === "BUY"
            ? "매수 주문"
            : "매도 주문"}
        </button>
      </div>
    </div>
  );
}

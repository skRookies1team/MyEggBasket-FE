// src/components/stock/chart/OrderPanel.tsx
import { useState } from "react";

import { StockOrderBook } from "../StockOrderBook";
import { orderStock } from "../../../api/tradeApi";

import type { OrderBookData } from "../../../types/stock";
import type {
  KisStockOrderRequest,
  OrderType,
} from "../../../types/trade";

import "../../../assets/Stock/OrderPanel.css";

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
      orderType,              //  BUY | SELL
      quantity,
      price,
      triggerSource: "MANUAL", //  필수 필드
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
    <div className="order-panel">
      {/* ===================== */}
      {/* 호가 UI */}
      {/* ===================== */}
      {orderBook ? (
        <StockOrderBook
          stockCode={stockCode}
          orderBook={orderBook}
          currentPrice={currentPrice}
          onSelectPrice={setPrice}
        />
      ) : (
        <div className="orderbook-empty">
          호가 데이터를 불러오는 중입니다.
        </div>
      )}

      {/* ===================== */}
      {/* 주문 컨트롤 */}
      {/* ===================== */}
      <div className="order-controls">
        <div className="order-side">
          <button
            className={orderType === "BUY" ? "active buy" : ""}
            onClick={() => setOrderType("BUY")}
          >
            매수
          </button>
          <button
            className={orderType === "SELL" ? "active sell" : ""}
            onClick={() => setOrderType("SELL")}
          >
            매도
          </button>
        </div>

        <div className="order-input">
          <label>가격</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>

        <div className="order-input">
          <label>수량</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div className="order-summary">
          총 금액: {(price * quantity).toLocaleString()} 원
        </div>

        {error && <div className="order-error">{error}</div>}

        <button
          className={`order-submit ${
            orderType === "BUY" ? "buy" : "sell"
          }`}
          onClick={handleOrder}
          disabled={loading}
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

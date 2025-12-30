// src/components/stock/chart/OrderPanel.tsx
import { useState, useMemo, useEffect } from "react";

import { StockOrderBook } from "../StockOrderBook";
import {
  orderStock,
  orderStockWithLimitPrice,
} from "../../../api/tradeApi";

import type { OrderBookData } from "../../../types/stock";
import type {
  KisStockOrderRequest,
  KisStockLimitPriceOrderRequest,
  OrderType,
} from "../../../types/trade";

type PriceType = "LIMIT" | "MARKET";

interface OrderPanelProps {
  stockCode: string;
  currentPrice: number;
  orderBook: OrderBookData | null;

  // 매도 전용
  holdingQty?: number;
  avgPrice?: number;

  // 매수 전용 (예수금)
  availableCash?: number;

  virtual?: boolean;
}

export function OrderPanel({
  stockCode,
  currentPrice,
  orderBook,
  holdingQty = 0,
  avgPrice = 0,
  availableCash = 0,
  virtual = false,
}: OrderPanelProps) {
  /* ================= tab ================= */
  const [orderType, setOrderType] = useState<OrderType>("BUY");

  /* ================= order ================= */
  const [priceType, setPriceType] = useState<PriceType>("LIMIT");
  const [price, setPrice] = useState<number>(currentPrice);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  /* 🔹 현재가 동기화 */
  useEffect(() => {
    setPrice(currentPrice);
  }, [currentPrice]);

  /* ================= derived ================= */

  // 매수 총 금액
  const buyTotal = useMemo<number | null>(() => {
    if (orderType !== "BUY") return null;
    if (priceType === "MARKET") return null;
    return price * quantity;
  }, [orderType, priceType, price, quantity]);

  // 매도 예상 손익
  const expectedProfit = useMemo<number | null>(() => {
    if (orderType !== "SELL") return null;
    if (priceType === "MARKET") return null;
    return (price - avgPrice) * quantity;
  }, [orderType, priceType, price, avgPrice, quantity]);

  // 매도 예상 수익률
  const expectedRate = useMemo<number | null>(() => {
    if (orderType !== "SELL") return null;
    if (priceType === "MARKET" || avgPrice === 0) return null;
    return ((price - avgPrice) / avgPrice) * 100;
  }, [orderType, priceType, price, avgPrice]);

  /* ================= handlers ================= */

  const handleOrder = async () => {
    // 매수 시 예수금 체크
    if (
      orderType === "BUY" &&
      priceType === "LIMIT" &&
      buyTotal !== null &&
      buyTotal > availableCash
    ) {
      alert("주문 가능 금액(예수금)을 초과했습니다.");
      return;
    }

    // 매도 시 보유 수량 체크
    if (orderType === "SELL" && quantity > holdingQty) {
      alert("보유 수량을 초과할 수 없습니다.");
      return;
    }

    try {
      setLoading(true);

      if (priceType === "MARKET") {
        /* ================= 시장가 주문 ================= */
        const payload: KisStockOrderRequest = {
          stockCode,
          orderType,
          quantity,
          price: 1,
          triggerSource: "MANUAL",
        };

        await orderStock(payload, virtual);
      } else {
        /* ================= 지정가 주문 ================= */
        const payload: KisStockLimitPriceOrderRequest = {
          stockCode,
          orderType,
          quantity,
          limitPrice: price,
          triggerSource: "MANUAL",
        };

        await orderStockWithLimitPrice(payload, virtual);
      }

      alert("주문이 접수되었습니다.");
    } catch (e) {
      console.error(e);
      alert("주문 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= render ================= */
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
          onSelectPrice={(p) => {
            setPriceType("LIMIT");
            setPrice(p);
          }}
        />
      ) : (
        <div className="flex h-[280px] items-center justify-center rounded-xl bg-[#0f0f17] text-sm text-gray-400">
          호가 데이터를 불러오는 중입니다.
        </div>
      )}

      {/* ===================== */}
      {/* Order Panel */}
      {/* ===================== */}
      <div className="rounded-xl bg-[#0f0f17] p-4 space-y-4">
        {/* 매수 / 매도 탭 */}
        <div className="flex rounded-lg bg-black/30 p-1">
          <button
            onClick={() => setOrderType("BUY")}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold ${
              orderType === "BUY"
                ? "bg-red-500/20 text-red-400"
                : "text-gray-400"
            }`}
          >
            매수
          </button>
          <button
            onClick={() => setOrderType("SELL")}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold ${
              orderType === "SELL"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400"
            }`}
          >
            매도
          </button>
        </div>

        {/* 가격 */}
        <div>
          <label className="mb-1 block text-xs text-gray-400">
            {orderType === "BUY" ? "구매 가격" : "판매 가격"}
          </label>

          <div className="mb-2 flex rounded-md bg-black/30 p-1">
            {(["LIMIT", "MARKET"] as PriceType[]).map((t) => (
              <button
                key={t}
                onClick={() => setPriceType(t)}
                className={`flex-1 rounded py-1 text-xs font-semibold ${
                  priceType === t
                    ? "bg-[#232332] text-white"
                    : "text-gray-400"
                }`}
              >
                {t === "LIMIT" ? "지정가" : "시장가"}
              </button>
            ))}
          </div>

          {/* 가격 +/- */}
          <div className="flex items-center gap-2">
            <button
              disabled={priceType === "MARKET"}
              onClick={() => setPrice((p) => Math.max(1, p - 100))}
              className="rounded bg-black/40 px-3 py-1 text-gray-300 disabled:opacity-40"
            >
              −
            </button>

            <input
              type="text"
              readOnly={priceType === "MARKET"}
              value={
                priceType === "MARKET"
                  ? "시장가로 체결됩니다"
                  : price.toLocaleString()
              }
              className={`flex-1 rounded px-3 py-2 text-sm ring-1 ring-[#232332] ${
                priceType === "MARKET"
                  ? "bg-black/20 text-white cursor-not-allowed"
                  : "bg-black/30 text-gray-100"
              }`}
            />

            <button
              disabled={priceType === "MARKET"}
              onClick={() => setPrice((p) => p + 100)}
              className="rounded bg-black/40 px-3 py-1 text-gray-300 disabled:opacity-40"
            >
              +
            </button>

            <span className="text-sm text-gray-400">원</span>
          </div>
        </div>

        {/* 수량 */}
        <div>
          <label className="mb-1 block text-xs text-gray-400">수량</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="rounded bg-black/40 px-3 py-1 text-gray-300"
            >
              −
            </button>

            <input
              type="number"
              min={1}
              max={orderType === "SELL" ? holdingQty : undefined}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="flex-1 rounded bg-black/30 px-3 py-2 text-sm text-gray-100 ring-1 ring-[#232332]"
            />

            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="rounded bg-black/40 px-3 py-1 text-gray-300"
            >
              +
            </button>

            <span className="text-sm text-gray-400">주</span>
          </div>
        </div>

        {/* 매수 정보 */}
        {orderType === "BUY" && (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>주문 가능 금액</span>
              <span>{availableCash.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-gray-200">
              <span>총 주문 금액</span>
              <span>
                {buyTotal === null ? "-" : `${buyTotal.toLocaleString()}원`}
              </span>
            </div>
          </div>
        )}

        {/* 매도 정보 */}
        {orderType === "SELL" && (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>내 주식 평균</span>
              <span>{avgPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>예상 수익률</span>
              <span
                className={
                  expectedRate !== null && expectedRate < 0
                    ? "text-blue-400"
                    : "text-red-400"
                }
              >
                {expectedRate === null ? "-" : `${expectedRate.toFixed(2)}%`}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>예상 손익</span>
              <span
                className={
                  expectedProfit !== null && expectedProfit < 0
                    ? "text-blue-400"
                    : "text-red-400"
                }
              >
                {expectedProfit === null
                  ? "-"
                  : `${expectedProfit.toLocaleString()}원`}
              </span>
            </div>
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          onClick={handleOrder}
          disabled={loading}
          className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white ${
            orderType === "BUY"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } disabled:opacity-60`}
        >
          {loading
            ? "주문 중..."
            : orderType === "BUY"
            ? "매수하기"
            : "매도하기"}
        </button>
      </div>
    </div>
  );
}

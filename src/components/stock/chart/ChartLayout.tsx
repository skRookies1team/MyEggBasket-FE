import type { Period, OrderBookData, StockPriceData } from "../../../types/stock";
import type { IndicatorState } from "../../../types/indicator";

import { ChartPanel } from "./ChartPanel";
import { OrderPanel } from "./OrderPanel";

import "../../../assets/Stock/ChartLayout.css";

interface Props {
  period: Period;
  indicators: IndicatorState;
  data: StockPriceData[];
  orderBook: OrderBookData | null; // ✅ null 허용
  currentPrice: number;
  stockCode: string;
}

export function ChartLayout({
  period,
  indicators,
  data,
  orderBook,
  currentPrice,
  stockCode,
}: Props) {
  return (
    <div className="chart-layout">
      {/* ===================== */}
      {/* 좌측: 차트 */}
      {/* ===================== */}
      <ChartPanel
        period={period}
        indicators={indicators}
        data={data}
      />

      {/* ===================== */}
      {/* 우측: 호가 + 주문 */}
      {/* ===================== */}
      <OrderPanel
        orderBook={orderBook}
        currentPrice={currentPrice}
        stockCode={stockCode}
      />
    </div>
  );
}

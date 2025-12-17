import type { Period, OrderBookData } from "../../../types/stock";
import type { IndicatorState } from "../../../types/indicator";

import { ChartPanel } from "./ChartPanel";
import { StockOrderBook } from "../StockOrderBook";

interface Props {
  period: Period;
  indicators: IndicatorState;

  orderBook: OrderBookData;
  currentPrice: number;
  stockCode: string;
}

export function ChartLayout({
  period,
  indicators,
  orderBook,
  currentPrice,
  stockCode,
}: Props) {
  return (
    <div className="chart-layout">
      {/* 좌측: 차트 */}
      <ChartPanel
        period={period}
        indicators={indicators}
      />

      {/* 우측: 호가 + 주문 */}
      <StockOrderBook
        orderBook={orderBook}
        currentPrice={currentPrice}
        stockCode={stockCode}
      />
    </div>
  );
}

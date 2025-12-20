import type {
  Period,
  OrderBookData,
  StockPriceData,
} from "../../../types/stock";
import type { IndicatorState } from "../../../types/indicator";

import { ChartPanel } from "./ChartPanel";
import { OrderPanel } from "./OrderPanel";

interface Props {
  period: Period;
  indicators: IndicatorState;
  data: StockPriceData[];
  orderBook: OrderBookData | null;
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
    <section
      className="
        grid grid-cols-1 gap-6
        xl:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]
      "
    >
      {/* ===================== */}
      {/* 좌측: 차트 패널 */}
      {/* ===================== */}
      <div
        className="
          rounded-2xl
          bg-gradient-to-b from-[#1a1a24] to-[#14141c]
          p-4 shadow
        "
      >
        <ChartPanel
          period={period}
          indicators={indicators}
          data={data}
        />
      </div>

      {/* ===================== */}
      {/* 우측: 호가 + 주문 패널 */}
      {/* ===================== */}
      <div
        className="
          rounded-2xl
          bg-gradient-to-b from-[#1a1a24] to-[#14141c]
          p-4 shadow
        "
      >
        <OrderPanel
          orderBook={orderBook}
          currentPrice={currentPrice}
          stockCode={stockCode}
        />
      </div>
    </section>
  );
}

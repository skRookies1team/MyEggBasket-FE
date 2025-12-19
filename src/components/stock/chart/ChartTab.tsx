import { useState } from "react";

import type { Period, OrderBookData } from "../../../types/stock";
import type { IndicatorState } from "../../../types/indicator";

import { ChartToolbar } from "./ChartToolbar";
import { ChartLayout } from "./ChartLayout";

interface ChartTabProps {
  stockCode: string;
  currentPrice: number;
  orderBook: OrderBookData;
}

export function ChartTab({
  stockCode,
  currentPrice,
  orderBook,
}: ChartTabProps) {
  // 기간
  const [period, setPeriod] = useState<Period>("day");

  // 보조지표 상태
  const [indicators, setIndicators] = useState<IndicatorState>({
    ma: false,
    bollinger: false,
    rsi: false,
    macd: false,
    stochastic: false,
  });

  return (
    <section className="chart-tab">
      <ChartToolbar
        period={period}
        onPeriodChange={setPeriod}
        indicators={indicators}
        onIndicatorChange={setIndicators}
      />

      <ChartLayout
        period={period}
        indicators={indicators}
        stockCode={stockCode}
        currentPrice={currentPrice}
        orderBook={orderBook}
      />
    </section>
  );
}

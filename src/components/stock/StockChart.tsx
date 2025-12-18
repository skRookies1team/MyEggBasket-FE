// src/components/stock/StockChart.tsx
import { useState } from "react";

import type { StockCandle, Period } from "../../types/stock";
import type { IndicatorState } from "../../types/indicator";

import { ChartLayout } from "./chart/ChartLayout";
import { ChartToolbar } from "./chart/ChartToolbar";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface StockChartProps {
  data: StockCandle[];
  period: Period;
  onPeriodChange?: (p: Period) => void;
  orderBook?: any;
  currentPrice?: number;
  stockCode?: string;
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function StockChart({
  data,
  period,
  onPeriodChange,
  orderBook,
  currentPrice = 0,
  stockCode = "",
}: StockChartProps) {
  const [indicators, setIndicators] = useState<IndicatorState>({
    ma: false,
    bollinger: false,
    rsi: false,
    macd: false,
    stochastic: false,
  });

  return (
    <div className="stock-chart">
      {/* Toolbar */}
      <ChartToolbar
        period={period}
        onPeriodChange={onPeriodChange ?? (() => {})}
        indicators={indicators}
        onIndicatorChange={setIndicators}
      />

      {/* Chart + OrderBook */}
      <ChartLayout
        period={period}
        indicators={indicators}
        data={data}                
        orderBook={orderBook}
        currentPrice={currentPrice}
        stockCode={stockCode}
      />
    </div>
  );
}

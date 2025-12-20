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
    <div
      className="
        flex flex-col gap-4
        rounded-2xl
        bg-gradient-to-b from-[#1a1a24] to-[#14141c]
        p-4
        shadow-[0_8px_24px_rgba(0,0,0,0.45)]
      "
    >
      {/* ---------------- Toolbar ---------------- */}
      <div className="rounded-xl bg-[#0f0f17] p-2">
        <ChartToolbar
          period={period}
          onPeriodChange={onPeriodChange ?? (() => {})}
          indicators={indicators}
          onIndicatorChange={setIndicators}
        />
      </div>

      {/* ---------------- Chart + OrderBook ---------------- */}
      <div
        className="
          flex-1
          overflow-hidden
          rounded-xl
          bg-[#0a0a0f]
          border border-[#232332]
        "
      >
        <ChartLayout
          period={period}
          indicators={indicators}
          data={data}
          orderBook={orderBook}
          currentPrice={currentPrice}
          stockCode={stockCode}
        />
      </div>
    </div>
  );
}

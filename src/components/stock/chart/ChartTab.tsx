import {useEffect, useState} from "react";

import type {Period, OrderBookData, StockPriceData} from "../../../types/stock";
import type { IndicatorState } from "../../../types/indicator";

import { ChartToolbar } from "./ChartToolbar";
import { ChartLayout } from "./ChartLayout";
import {fetchHistoricalData} from "../../../api/stocksApi.ts";

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
const [chartData, setChartData] = useState<StockPriceData[]>([]);

  // 보조지표 상태
  const [indicators, setIndicators] = useState<IndicatorState>({
    ma: false,
    bollinger: false,
    rsi: false,
    macd: false,
    stochastic: false,
  });

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchHistoricalData(stockCode, period);
                if (data) {
                    // 데이터 매핑 (price 추가)
                    const mapped = data.map(d => ({
                        ...d,
                        time: String(d.time),
                        price: Number(d.close), // 필수
                        close: Number(d.close)
                    }));
                    setChartData(mapped);
                }
            } catch (e) {
                console.error(e);
            }
        };
        loadData();
    }, [stockCode, period]);

  return (
    <section className="flex flex-col gap-4">
      {/* ===================== */}
      {/* Chart Toolbar */}
      {/* ===================== */}
      <div
        className="
          sticky top-0 z-20
          rounded-2xl
          bg-gradient-to-b from-[#1a1a24] to-[#14141c]
          p-4 shadow
        "
      >
        <ChartToolbar
          period={period}
          onPeriodChange={setPeriod}
          indicators={indicators}
          onIndicatorChange={setIndicators}
        />
      </div>

      {/* ===================== */}
      {/* Chart + Order Layout */}
      {/* ===================== */}
      <ChartLayout
        period={period}
        indicators={indicators}
        stockCode={stockCode}
        currentPrice={currentPrice}
        orderBook={orderBook}
        data={chartData}
      />
    </section>
  );
}

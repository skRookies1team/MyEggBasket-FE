// stock/chart/PriceVolumeChart.tsx
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";

import type { IChartApi, ISeriesApi } from "lightweight-charts";

import type { Period, StockCandle } from "../../../types/stock";
import type {
  MAIndicator,
  BollingerIndicator,
} from "../../../types/indicator";

import { MAChart } from "./MAChart";
import { BollingerChart } from "./BollingerChart";

interface Props {
  candles: StockCandle[];         
  period: Period;

  showMA?: boolean;
  showBollinger?: boolean;

  maIndicators?: MAIndicator[];
  bollinger?: BollingerIndicator | null;
  height?: number;
}

export function PriceVolumeChart({
  candles,
  period,
  showMA = true,
  showBollinger = true,
  maIndicators = [],
  bollinger = null,
  height = 420,
}: Props) {
  // eslint / ts unused 방지 (추후 timeScale 옵션에 사용 예정)
  void period;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [chart, setChart] = useState<IChartApi | null>(null);

  const candleSeriesRef =
    useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef =
    useRef<ISeriesApi<"Histogram"> | null>(null);

  /* ------------------ Chart init ------------------ */
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#0f172a" },
        textColor: "#cbd5f5",
      },
      grid: {
        vertLines: { color: "rgba(148,163,184,0.1)" },
        horzLines: { color: "rgba(148,163,184,0.1)" },
      },
      rightPriceScale: {
        borderColor: "rgba(148,163,184,0.3)",
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderUpColor: "#ef4444",
      borderDownColor: "#3b82f6",
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chart.timeScale().fitContent();

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    setChart(chart);

    return () => {
      chart.remove();
      setChart(null);
    };
  }, [height]);

  /* ------------------ Data update ------------------ */
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    if (!candles.length) return;

    candleSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    volumeSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color:
          c.close >= c.open
            ? "rgba(239,68,68,0.6)"
            : "rgba(59,130,246,0.6)",
      }))
    );
  }, [candles]);

  return (
    <>
      <div ref={containerRef} style={{ width: "100%" }} />

      {/* MA */}
      {showMA && (
        <MAChart
          chart={chart}
          indicators={maIndicators}
        />
      )}

      {/* Bollinger */}
      {showBollinger && (
        <BollingerChart
          chart={chart}
          bollinger={bollinger}
        />
      )}
    </>
  );
}

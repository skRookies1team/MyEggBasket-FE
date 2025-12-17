// stock/chart/PriceVolumeChart.tsx
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";

import type {
  IChartApi,
  ISeriesApi
} from "lightweight-charts";

import type { StockPriceData } from "../../../types/stock";
import type {
  MAIndicator,
  BollingerIndicator,
} from "../../../types/indicator";

import { normalizeTime } from "./utils";
import { MAChart } from "./MAChart";
import { BollingerChart } from "./BollingerChart";

interface Props {
  data: StockPriceData[];
  maIndicators?: MAIndicator[];
  bollinger?: BollingerIndicator | null;
  height?: number;
}

export function PriceVolumeChart({
  data,
  maIndicators = [],
  bollinger = null,
  height = 420,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 🔥 핵심: chart를 state로 관리
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
        borderColor: "rgba(148,163,184,0.3)" },
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

    // 여기!
    setChart(chart);

    return () => {
      chart.remove();
      setChart(null);
    };
  }, [height]);

  /* ------------------ Data update ------------------ */
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    if (!data?.length) return;

    candleSeriesRef.current.setData(
      data
        .filter((d) => d.open && d.high && d.low)
        .map((d) => ({
          time: normalizeTime(d.time),
          open: d.open!,
          high: d.high!,
          low: d.low!,
          close: d.close,
        }))
    );

    volumeSeriesRef.current.setData(
      data.map((d) => ({
        time: normalizeTime(d.time),
        value: d.volume ?? 0,
        color:
          d.close >= (d.open ?? d.close)
            ? "rgba(239,68,68,0.6)"
            : "rgba(59,130,246,0.6)",
      }))
    );
  }, [data]);

  return (
    <>
      <div ref={containerRef} style={{ width: "100%" }} />

      {/* 이제 chart가 null → 실제 값으로 바뀌며 리렌더 발생 */}
      <MAChart chart={chart} indicators={maIndicators} />
      <BollingerChart chart={chart} bollinger={bollinger} />
    </>
  );
}

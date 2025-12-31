// stock/chart/VolumeChart.tsx
import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  HistogramSeries,
} from "lightweight-charts";

import type {
  IChartApi,
  ISeriesApi,
  HistogramData,
  UTCTimestamp,
} from "lightweight-charts";

import type { StockCandle } from "../../../types/stock";
import { normalizeTime } from "./utils";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface VolumeChartProps {
  candles: StockCandle[];
  height?: number;

  /** ChartPanel에서 timeScale 동기화 */
  onChartReady?: (chart: IChartApi) => void;
  onChartDispose?: (chart: IChartApi) => void;
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function VolumeChart({
  candles,
  height = 120,
  onChartReady,
  onChartDispose,
}: VolumeChartProps) {
  /* ------------------ refs ------------------ */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  /* ------------------ chart init ------------------ */
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
        autoScale: true,
        scaleMargins: { top: 0.8, bottom: 0 },
      },
      timeScale: {
        visible: false, // 공용 X축 (PriceChart만 표시)
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },

      /* 🔑 드래그/휠 안정화 */
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        mouseWheel: true,
        axisPressedMouseMove: true,
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceLineVisible: false,
    });

    chartRef.current = chart;
    volumeRef.current = volumeSeries;

    onChartReady?.(chart);

    return () => {
      onChartDispose?.(chart); // ⭐ 반드시 필요
      chart.remove();

      chartRef.current = null;
      volumeRef.current = null;
    };
  }, [height, onChartReady, onChartDispose]);

  /* ------------------ data update ------------------ */
  useEffect(() => {
    if (!volumeRef.current) return;
    if (!candles?.length) return;

    const volumeData: HistogramData<UTCTimestamp>[] = candles.map((c) => ({
      time: normalizeTime(c.time),
      value: c.volume,
      color:
        c.close >= c.open
          ? "rgba(239,68,68,0.6)"   // 상승
          : "rgba(59,130,246,0.6)", // 하락
    }));

    volumeRef.current.setData(volumeData);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

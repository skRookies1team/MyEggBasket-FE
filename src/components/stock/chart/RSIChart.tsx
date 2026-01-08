// stock/chart/RSIChart.tsx
import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
} from "lightweight-charts";

import type {
  IChartApi,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";

import type { RSIIndicator } from "../../../types/indicator";
import { normalizeTime } from "./utils";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface RSIChartProps {
  indicator: RSIIndicator;
  height?: number;

  /** ChartPanel에서 timeScale 동기화 */
  onChartReady?: (chart: IChartApi) => void;
  onChartDispose?: (chart: IChartApi) => void;
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function RSIChart({
  indicator,
  height = 140,
  onChartReady,
  onChartDispose,
}: RSIChartProps) {
  /* ------------------ refs ------------------ */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

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
        autoScale: false,
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      timeScale: {
        visible: false, // ⬅️ 공용 X축
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

    const rsiSeries = chart.addSeries(LineSeries, {
      color: "#a855f7",
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    // 기준선
    rsiSeries.createPriceLine({
      price: 70,
      color: "#ef4444",
      lineStyle: 2,
      axisLabelVisible: true,
      title: "70",
    });

    rsiSeries.createPriceLine({
      price: 30,
      color: "#3b82f6",
      lineStyle: 2,
      axisLabelVisible: true,
      title: "30",
    });

    chartRef.current = chart;
    rsiSeriesRef.current = rsiSeries;

    onChartReady?.(chart);

    return () => {
      onChartDispose?.(chart); // ⭐ 핵심
      chart.remove();

      chartRef.current = null;
      rsiSeriesRef.current = null;
    };
  }, [height, onChartReady, onChartDispose]);

  /* ------------------ data update ------------------ */
  useEffect(() => {
    if (!rsiSeriesRef.current) return;
    if (!indicator?.data?.length) return;

    const seriesData: LineData<UTCTimestamp>[] =
      indicator.data.map((p) => ({
        time: normalizeTime(p.time),
        value: p.value,
      }));

    rsiSeriesRef.current.setData(seriesData);
  }, [indicator]);

  return (
      <div className="relative w-full">
        <div className="absolute left-3 top-2 z-10 text-xs font-semibold text-white">
          RSI (14)
        </div>
        <div ref={containerRef} className="w-full" />
      </div>
  );}

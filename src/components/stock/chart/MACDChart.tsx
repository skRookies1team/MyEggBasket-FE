// stock/chart/MACDChart.tsx
import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  HistogramSeries,
} from "lightweight-charts";

import type {
  IChartApi,
  ISeriesApi,
  LineData,
  HistogramData,
  UTCTimestamp,
} from "lightweight-charts";

import type { MACDIndicator } from "../../../types/indicator";
import { normalizeTime } from "./utils";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface MACDChartProps {
  indicator: MACDIndicator;
  height?: number;

  /** ChartPanel에서 timeScale 동기화 */
  onChartReady?: (chart: IChartApi) => void;
  onChartDispose?: (chart: IChartApi) => void;
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function MACDChart({
  indicator,
  height = 160,
  onChartReady,
  onChartDispose,
}: MACDChartProps) {
  /* ------------------ refs ------------------ */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const macdRef = useRef<ISeriesApi<"Line"> | null>(null);
  const signalRef = useRef<ISeriesApi<"Line"> | null>(null);
  const histRef = useRef<ISeriesApi<"Histogram"> | null>(null);

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
        scaleMargins: { top: 0.2, bottom: 0.2 },
      },
      timeScale: {
        visible: false, // ⬅️ 공용 X축
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },

      /* 🔑 드래그 / 휠 안정화 */
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        mouseWheel: true,
        axisPressedMouseMove: true,
      },
    });

    /* ------------------ Series ------------------ */
    const histogram = chart.addSeries(HistogramSeries, {
      base: 0,
      priceFormat: {
        type: "custom",
        formatter: (v: number) => v.toFixed(2),
      },
      priceLineVisible: false,
    });

    const macdLine = chart.addSeries(LineSeries, {
      color: "#22c55e",
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const signalLine = chart.addSeries(LineSeries, {
      color: "#f97316",
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    // 0 기준선
    macdLine.createPriceLine({
      price: 0,
      color: "rgba(148,163,184,0.4)",
      lineStyle: 2,
      axisLabelVisible: false,
    });

    chartRef.current = chart;
    macdRef.current = macdLine;
    signalRef.current = signalLine;
    histRef.current = histogram;

    onChartReady?.(chart);

    return () => {
      onChartDispose?.(chart); // ⭐ 핵심
      chart.remove();

      chartRef.current = null;
      macdRef.current = null;
      signalRef.current = null;
      histRef.current = null;
    };
  }, [height, onChartReady, onChartDispose]);

  /* ------------------ data update ------------------ */
  useEffect(() => {
    if (!macdRef.current || !signalRef.current || !histRef.current) return;
    if (
      !indicator?.macd?.length ||
      !indicator?.signalLine?.length ||
      !indicator?.histogram?.length
    )
      return;

    const macdData: LineData<UTCTimestamp>[] = indicator.macd.map((p) => ({
      time: normalizeTime(p.time),
      value: p.value,
    }));

    const signalData: LineData<UTCTimestamp>[] =
      indicator.signalLine.map((p) => ({
        time: normalizeTime(p.time),
        value: p.value,
      }));

    const histData: HistogramData<UTCTimestamp>[] =
      indicator.histogram.map((p) => ({
        time: normalizeTime(p.time),
        value: p.value,
        color:
          p.value >= 0
            ? "rgba(34,197,94,0.8)"
            : "rgba(239,68,68,0.8)",
      }));

    macdRef.current.setData(macdData);
    signalRef.current.setData(signalData);
    histRef.current.setData(histData);

  }, [indicator]);

  return (
      <div className="relative w-full">
        <div className="absolute left-3 top-2 z-10 text-xs font-semibold text-white">
          MACD (12, 26, 9)
        </div>
        <div ref={containerRef} className="w-full" />
      </div>
  );}

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
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function MACDChart({ indicator, height = 160 }: MACDChartProps) {
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
      timeScale: { timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
    });

    const histogram = chart.addSeries(HistogramSeries, {
      base: 0,
      priceFormat: {
        type: "custom",
        formatter: (v: number) => v.toFixed(2),
      },
    });

    const macdLine = chart.addSeries(LineSeries, {
      color: "#22c55e",
      lineWidth: 2,
      title: "MACD",
    });

    const signalLine = chart.addSeries(LineSeries, {
      color: "#f97316",
      lineWidth: 2,
      title: "Signal",
    });

    // 0 기준선
    macdLine.createPriceLine({
      price: 0,
      color: "rgba(148,163,184,0.4)",
      lineStyle: 2,
      axisLabelVisible: false,
    });

    chart.timeScale().fitContent();

    chartRef.current = chart;
    macdRef.current = macdLine;
    signalRef.current = signalLine;
    histRef.current = histogram;

    return () => {
      chart.remove();
      chartRef.current = null;
      macdRef.current = null;
      signalRef.current = null;
      histRef.current = null;
    };
  }, [height]);

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

    const signalData: LineData<UTCTimestamp>[] = indicator.signalLine.map((p) => ({
      time: normalizeTime(p.time),
      value: p.value,
    }));

    const histData: HistogramData<UTCTimestamp>[] = indicator.histogram.map((p) => ({
      time: normalizeTime(p.time),
      value: p.value,
      color: p.value >= 0 ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.8)",
    }));

    macdRef.current.setData(macdData);
    signalRef.current.setData(signalData);
    histRef.current.setData(histData);
  }, [indicator]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

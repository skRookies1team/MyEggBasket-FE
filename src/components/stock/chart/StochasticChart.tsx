import { useEffect, useRef } from "react";
import { createChart, ColorType, LineSeries } from "lightweight-charts";

import type {
  IChartApi,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";

import type { StochasticIndicator } from "../../../types/indicator";
import { normalizeTime } from "./utils";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface StochasticChartProps {
  indicator: StochasticIndicator;
  height?: number;
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function StochasticChart({
  indicator,
  height = 140,
}: StochasticChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const kRef = useRef<ISeriesApi<"Line"> | null>(null);
  const dRef = useRef<ISeriesApi<"Line"> | null>(null);

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
      timeScale: { timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
    });

    const kLine = chart.addSeries(LineSeries, {
      color: "#60a5fa",
      lineWidth: 2,
      title: "%K",
    });

    const dLine = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 2,
      title: "%D",
    });

    // 기준선 80/20
    kLine.createPriceLine({
      price: 80,
      color: "rgba(239,68,68,0.8)",
      lineStyle: 2,
      axisLabelVisible: true,
      title: "80",
    });

    kLine.createPriceLine({
      price: 20,
      color: "rgba(59,130,246,0.8)",
      lineStyle: 2,
      axisLabelVisible: true,
      title: "20",
    });

    chart.timeScale().fitContent();

    chartRef.current = chart;
    kRef.current = kLine;
    dRef.current = dLine;

    return () => {
      chart.remove();
      chartRef.current = null;
      kRef.current = null;
      dRef.current = null;
    };
  }, [height]);

  /* ------------------ data update ------------------ */
  useEffect(() => {
    if (!kRef.current || !dRef.current) return;
    if (!indicator?.k?.length || !indicator?.d?.length) return;

    const kData: LineData<UTCTimestamp>[] = indicator.k.map((p) => ({
      time: normalizeTime(p.time),
      value: p.value,
    }));

    const dData: LineData<UTCTimestamp>[] = indicator.d.map((p) => ({
      time: normalizeTime(p.time),
      value: p.value,
    }));

    kRef.current.setData(kData);
    dRef.current.setData(dData);
  }, [indicator]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

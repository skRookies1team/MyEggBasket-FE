// stock/chart/StochasticChart.tsx
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

  /** ChartPanel에서 timeScale 동기화 */
  onChartReady?: (chart: IChartApi) => void;
  onChartDispose?: (chart: IChartApi) => void;
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function StochasticChart({
  indicator,
  height = 140,
  onChartReady,
  onChartDispose,
}: StochasticChartProps) {
  /* ------------------ refs ------------------ */
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
      timeScale: {
        visible: false, // ⬅️ 공용 X축 (PriceChart만 표시)
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

    const kLine = chart.addSeries(LineSeries, {
      color: "#60a5fa",
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const dLine = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    // 기준선 80 / 20
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

    chartRef.current = chart;
    kRef.current = kLine;
    dRef.current = dLine;

    onChartReady?.(chart);

    return () => {
      onChartDispose?.(chart); // ⭐ 핵심
      chart.remove();

      chartRef.current = null;
      kRef.current = null;
      dRef.current = null;
    };
  }, [height, onChartReady, onChartDispose]);

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
    chartRef.current?.timeScale().fitContent();

  }, [indicator]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

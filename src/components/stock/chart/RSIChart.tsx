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

import type { StockPriceData } from "../../../types/stock";
import { normalizeTime } from "./utils";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface RSIChartProps {
  data: (StockPriceData & { rsi?: number })[];
  height?: number;
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function RSIChart({
  data,
  height = 140,
}: RSIChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const rsiSeriesRef =
    useRef<ISeriesApi<"Line"> | null>(null);

  /* ------------------ chart init ------------------ */
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#0f172a",
        },
        textColor: "#cbd5f5",
      },
      grid: {
        vertLines: { color: "rgba(148,163,184,0.1)" },
        horzLines: { color: "rgba(148,163,184,0.1)" },
      },
      rightPriceScale: {
        borderColor: "rgba(148,163,184,0.3)",
        autoScale: false,
        scaleMargins: {
          top: 0.15,
          bottom: 0.15,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "rgba(148,163,184,0.3)",
      },
      crosshair: {
        mode: 1,
      },
    });

    /* RSI Line */
    const rsiSeries = chart.addSeries(LineSeries, {
      color: "#a855f7",
      lineWidth: 2,
    });

    /* RSI fixed range */
    chart.priceScale("right").setAutoScale(false);
    chart.priceScale("right").applyOptions({
      scaleMargins: { top: 0.15, bottom: 0.15 },
    });

    // 기준선 (30 / 70)
    rsiSeries.createPriceLine({
      price: 70,
      color: "#ef4444",
      lineWidth: 1,
      lineStyle: 2, // dashed
      axisLabelVisible: true,
      title: "70",
    });

    rsiSeries.createPriceLine({
      price: 30,
      color: "#3b82f6",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "30",
    });

    chart.timeScale().fitContent();

    chartRef.current = chart;
    rsiSeriesRef.current = rsiSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [height]);

  /* ------------------ data update ------------------ */
  useEffect(() => {
    if (!rsiSeriesRef.current) return;
    if (!data || data.length === 0) return;

    const rsiData: LineData<UTCTimestamp>[] = data
      .filter((d) => d.rsi !== undefined)
      .map((d) => ({
        time: normalizeTime(d.time),
        value: d.rsi!,
      }));

    rsiSeriesRef.current.setData(rsiData);
  }, [data]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

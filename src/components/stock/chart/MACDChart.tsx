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

import type { StockPriceData } from "../../../types/stock";
import { normalizeTime } from "./utils";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface MACDChartProps {
  data: (StockPriceData & {
    macd?: number;
    signal?: number;
    histogram?: number;
  })[];
  height?: number;
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function MACDChart({
  data,
  height = 160,
}: MACDChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const macdRef =
    useRef<ISeriesApi<"Line"> | null>(null);
  const signalRef =
    useRef<ISeriesApi<"Line"> | null>(null);
  const histRef =
    useRef<ISeriesApi<"Histogram"> | null>(null);

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
        autoScale: true,
        scaleMargins: {
          top: 0.2,
          bottom: 0.2,
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

    /* Histogram */
    const histogram = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "price",
      },
      base: 0,
    });

    /* MACD Line */
    const macdLine = chart.addSeries(LineSeries, {
      color: "#22c55e",
      lineWidth: 2,
      title: "MACD",
    });

    /* Signal Line */
    const signalLine = chart.addSeries(LineSeries, {
      color: "#f97316",
      lineWidth: 2,
      title: "Signal",
    });

    chart.timeScale().fitContent();

    chartRef.current = chart;
    macdRef.current = macdLine;
    signalRef.current = signalLine;
    histRef.current = histogram;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [height]);

  /* ------------------ data update ------------------ */
  useEffect(() => {
    if (!macdRef.current || !signalRef.current || !histRef.current) return;
    if (!data || data.length === 0) return;

    const macdData: LineData<UTCTimestamp>[] = [];
    const signalData: LineData<UTCTimestamp>[] = [];
    const histData: HistogramData<UTCTimestamp>[] = [];

    data.forEach((d) => {
      const time = normalizeTime(d.time);

      if (d.macd !== undefined) {
        macdData.push({ time, value: d.macd });
      }

      if (d.signal !== undefined) {
        signalData.push({ time, value: d.signal });
      }

      if (d.histogram !== undefined) {
        histData.push({
          time,
          value: d.histogram,
          color:
            d.histogram >= 0
              ? "rgba(34,197,94,0.8)" // green
              : "rgba(239,68,68,0.8)", // red
        });
      }
    });

    macdRef.current.setData(macdData);
    signalRef.current.setData(signalData);
    histRef.current.setData(histData);
  }, [data]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

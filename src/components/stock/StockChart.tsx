import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";

import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  UTCTimestamp,
} from "lightweight-charts";

import type { StockPriceData } from "../../types/stock";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface StockChartProps {
  data: StockPriceData[];
  height?: number;
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function StockChart({ data, height = 420 }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef =
    useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef =
    useRef<ISeriesApi<"Histogram"> | null>(null);

  /* ------------------ chart init ------------------ */
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#0f172a", // dark
        },
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
        borderColor: "rgba(148,163,184,0.3)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    });

    //  v4 방식: addSeries
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

    // v4 방식 scaleMargins
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [height]);

  /* ------------------ data update ------------------ */
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    if (!data || data.length === 0) return;

    const candleData: CandlestickData<UTCTimestamp>[] = data
      .filter(
        (d): d is StockPriceData & {
          open: number;
          high: number;
          low: number;
        } =>
          d.open !== undefined &&
          d.high !== undefined &&
          d.low !== undefined
      )
      .map((d) => ({
        time: normalizeTime(d.time),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

    const volumeData: HistogramData[] = data.map((d) => ({
      time: normalizeTime(d.time),
      value: d.volume ?? 0,
      color: d.close >= d.open
        ? "rgba(239,68,68,0.6)"
        : "rgba(59,130,246,0.6)",
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
  }, [data]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

/* ------------------------------------------------------------------ */
/* Utils */
/* ------------------------------------------------------------------ */
function normalizeTime(
  time: string | number
): UTCTimestamp {
  // YYYY-MM-DD
  if (typeof time === "string") {
    return (new Date(time).getTime() / 1000) as UTCTimestamp;
  }

  // unix timestamp (ms or sec)
  return (time > 1e12 ? time / 1000 : time) as UTCTimestamp;
}

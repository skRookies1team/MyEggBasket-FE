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

import type { StochasticIndicator } from "../../../types/indicator";
import { normalizeTime } from "./utils";

interface Props {
  data: StochasticIndicator;
  height?: number;
}

export function StochasticChart({
  data,
  height = 140,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const kRef = useRef<ISeriesApi<"Line"> | null>(null);
  const dRef = useRef<ISeriesApi<"Line"> | null>(null);

  /* chart init */
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#020617" },
        textColor: "#cbd5f5",
      },
      rightPriceScale: {
        autoScale: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
    });

    const kSeries = chart.addSeries(LineSeries, {
      color: "#22c55e", // %K
      lineWidth: 2,
    });

    const dSeries = chart.addSeries(LineSeries, {
      color: "#eab308", // %D
      lineWidth: 2,
    });

    chartRef.current = chart;
    kRef.current = kSeries;
    dRef.current = dSeries;

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [height]);

  /* data update */
  useEffect(() => {
    if (!kRef.current || !dRef.current) return;

    const toLine = (arr: any[]): LineData<UTCTimestamp>[] =>
      arr.map((d) => ({
        time: normalizeTime(d.time),
        value: d.value,
      }));

    kRef.current.setData(toLine(data.k));
    dRef.current.setData(toLine(data.d));
  }, [data]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

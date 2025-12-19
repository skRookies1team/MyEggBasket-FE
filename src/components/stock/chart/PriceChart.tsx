// stock/chart/PriceChart.tsx
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";

import type { IChartApi, ISeriesApi } from "lightweight-charts";

import type { Period, StockCandle } from "../../../types/stock";
import type { MAIndicator, BollingerIndicator } from "../../../types/indicator";

import { MAChart } from "./MAChart";
import { BollingerChart } from "./BollingerChart";

/* ------------------ Hover 타입 ------------------ */
export interface HoverOHLC {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/* ------------------ Props ------------------ */
interface Props {
  candles: StockCandle[];
  period: Period;

  showMA?: boolean;
  showBollinger?: boolean;

  maIndicators?: MAIndicator[];
  bollinger?: BollingerIndicator | null;
  height?: number;

  /** 마우스 호버(크로스헤어 이동) 시 OHLC/Volume 전달 */
  onHover?: (ohlc: HoverOHLC | null) => void;
}

export function PriceChart({
  candles,
  period,
  showMA = true,
  showBollinger = true,
  maIndicators = [],
  bollinger = null,
  height = 420,
  onHover,
}: Props) {
  // eslint / ts unused 방지 (추후 timeScale 옵션에 사용 예정)
  void period;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [chart, setChart] = useState<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  /* ------------------ Chart init ------------------ */
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
        borderColor: "rgba(148,163,184,0.3)",
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
    });

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

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chart.timeScale().fitContent();

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    /* ------------------ Hover ------------------ */
    const handleCrosshairMove = (param: any) => {
      const candleSeriesApi = candleSeriesRef.current;
      const volumeSeriesApi = volumeSeriesRef.current;

      if (!param?.time || !candleSeriesApi || !volumeSeriesApi) {
        onHover?.(null);
        return;
      }

      const prices = param.seriesPrices as Map<any, any> | undefined;
      if (!prices) {
        onHover?.(null);
        return;
      }

      const price = prices.get(candleSeriesApi);
      const volume = prices.get(volumeSeriesApi);

      if (!price) {
        onHover?.(null);
        return;
      }

      onHover?.({
        open: Number(price.open),
        high: Number(price.high),
        low: Number(price.low),
        close: Number(price.close),
        volume: typeof volume === "number" ? volume : Number(volume ?? 0),
      });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    setChart(chart);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
      setChart(null);
    };
  }, [height, onHover]);

  /* ------------------ Data update ------------------ */
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    if (!candles.length) return;

    candleSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    volumeSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color:
          c.close >= c.open
            ? "rgba(239,68,68,0.6)"
            : "rgba(59,130,246,0.6)",
      }))
    );
  }, [candles]);

  return (
    <>
      <div ref={containerRef} style={{ width: "100%" }} />

      {/* MA */}
      {showMA && <MAChart chart={chart} indicators={maIndicators} />}

      {/* Bollinger */}
      {showBollinger && <BollingerChart chart={chart} bollinger={bollinger} />}
    </>
  );
}

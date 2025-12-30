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

/**
 * [Helper] 차트용 시간 포맷 정규화
 * - minute: Unix Timestamp (number)
 * - day/week/month: YYYY-MM-DD (string)
 */
const normalizeTime = (time: string | number, period: Period): any => {
  if (typeof time === "number") return time as any; // 이미 timestamp라면 그대로 반환

  const strTime = String(time);

  // 1. 분봉인 경우: ISO string 등을 Timestamp로 변환
  if (period === "minute") {
    // 이미 숫자형 문자열이면 숫자로
    if (!isNaN(Number(strTime))) return Number(strTime);

    // ISO String (YYYY-MM-DDTHH:mm:ss...) -> Unix Timestamp
    const date = new Date(strTime);
    if (!isNaN(date.getTime())) {
      // lightweight-charts는 초 단위 timestamp 사용
      return Math.floor(date.getTime() / 1000) as any;
    }
  }

  // 2. 일봉/주봉 등인 경우: 'T' 제거하고 날짜만 추출 (YYYY-MM-DD)
  if (strTime.includes("T")) {
    return strTime.split("T")[0];
  }

  return strTime;
};

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

    // 데이터가 없어도 에러나지 않도록 처리
    // chart.timeScale().fitContent(); // 데이터 셋팅 후 호출하는 것이 좋음

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

      const prices = param.seriesData as Map<any, any> | undefined;
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
    // 빈 배열이라도 setData([]) 호출해서 차트 초기화 가능하게 함

    // [수정] 데이터 매핑 시 normalizeTime 적용
    const formattedCandles = candles.map((c) => ({
      ...c,
      time: normalizeTime(c.time, period), // 여기서 변환!
    }));

    // 중복 제거 및 시간순 정렬 (안전장치)
    // Lightweight-charts는 시간이 정렬되어 있어야 함
    formattedCandles.sort((a, b) => {
      const ta = typeof a.time === 'number' ? a.time : new Date(a.time).getTime();
      const tb = typeof b.time === 'number' ? b.time : new Date(b.time).getTime();
      return ta - tb;
    });

    try {
      candleSeriesRef.current.setData(
          formattedCandles.map((c) => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
      );

      volumeSeriesRef.current.setData(
          formattedCandles.map((c) => ({
            time: c.time,
            value: c.volume,
            color:
                c.close >= c.open
                    ? "rgba(239,68,68,0.6)"
                    : "rgba(59,130,246,0.6)",
          }))
      );

      if (chart && formattedCandles.length > 0) {
        chart.timeScale().fitContent();
      }
    } catch (e) {
      console.error("[PriceChart] Data set error:", e);
    }

  }, [candles, period, chart]); // period, chart 의존성 추가

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
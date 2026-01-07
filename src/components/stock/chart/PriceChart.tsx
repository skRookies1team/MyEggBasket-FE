// src/components/stock/chart/PriceChart.tsx
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  CandlestickData, // [추가] 타입 필요
} from "lightweight-charts";

import type { IChartApi, ISeriesApi } from "lightweight-charts";

import type { Period, StockCandle } from "../../../types/stock";
import type {
  MAIndicator,
  BollingerIndicator,
} from "../../../types/indicator";

import { MAChart } from "./MAChart";
import { BollingerChart } from "./BollingerChart";

/* ------------------ Hover 타입 ------------------ */
export interface HoverOHLC {
  open: number;
  high: number;
  low: number;
  close: number;
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

  /** 마우스 호버(크로스헤어 이동) 시 OHLC 전달 */
  onHover?: (ohlc: HoverOHLC | null) => void;

  /** ChartPanel 동기화 */
  onChartReady?: (chart: IChartApi) => void;
  onChartDispose?: (chart: IChartApi) => void;
}

/* ------------------ time normalize ------------------ */
const normalizeTime = (time: string | number, period: Period): any => {
  if (typeof time === "number") return time;

  const str = String(time);

  if (period === "minute") {
    if (!isNaN(Number(str))) return Number(str);

    // "YYYY-MM-DD HH:mm:ss" 포맷 처리
    const d = new Date(str.replace(" ", "T"));

    // UTC 타임스탬프(초)에 9시간(32400초)을 더해 KST로 보정
    return Math.floor(d.getTime() / 1000) + 32400;
  }

  // 일봉 등 날짜 문자열인 경우
  if (str.includes("T")) return str.split("T")[0];
  if (str.includes(" ")) return str.split(" ")[0];

  return str;
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
                             onChartReady,
                             onChartDispose,
                           }: Props) {
  /* ------------------ refs ------------------ */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // [신규] 초기 데이터 로딩 여부를 추적하여 줌 리셋 방지
  const isLoadedRef = useRef(false);

  // 1. onHover를 ref에 저장
  const onHoverRef = useRef(onHover);

  // 2. onHover prop이 바뀔 때마다 ref 업데이트
  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  const [chartState, setChartState] = useState<IChartApi | null>(null);

  /* ------------------ Chart init ------------------ */
  useEffect(() => {
    if (!containerRef.current) return;

    // 차트 생성
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
        fixRightEdge: true,
      },
      crosshair: { mode: 1 },

      /* 드래그/휠 안정화 */
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        mouseWheel: true,
        axisPressedMouseMove: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderUpColor: "#ef4444",
      borderDownColor: "#3b82f6",
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    setChartState(chart);

    /* ------------------ Hover ------------------ */
    const handleCrosshairMove = (param: any) => {
      if (!param?.time || !candleSeriesRef.current) {
        onHover?.(null);
        return;
      }

      const prices = param.seriesData as Map<any, any> | undefined;
      const price = prices?.get(candleSeriesRef.current);

      if (!price) {
        onHover?.(null);
        return;
      }

      onHoverRef.current?.({
        open: Number(price.open),
        high: Number(price.high),
        low: Number(price.low),
        close: Number(price.close),
      });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    onChartReady?.(chart);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      onChartDispose?.(chart);
      chart.remove();

      chartRef.current = null;
      candleSeriesRef.current = null;
      setChartState(null);
      isLoadedRef.current = false; // 컴포넌트 제거 시 초기화
    };
  }, [height, onChartReady, onChartDispose]);

  /* ------------------ Period Change Reset ------------------ */
  // 기간(일/주/월/분)이 바뀌면 차트를 리셋하고 다시 fitContent 해야 함
  useEffect(() => {
    isLoadedRef.current = false;
  }, [period]);

  /* ------------------ Data update ------------------ */
  useEffect(() => {
    if (!candleSeriesRef.current || !chartRef.current) return;

    // 1. 데이터 정규화
    const normalized = candles.map((c) => ({
      ...c,
      time: normalizeTime(c.time, period),
    }));

    // 2. 중복 제거
    const uniqueDataMap = new Map();
    normalized.forEach((item) => {
      uniqueDataMap.set(item.time, item);
    });

    // 3. 정렬
    const formatted = Array.from(uniqueDataMap.values()).sort((a, b) => {
      const ta = typeof a.time === "number" ? a.time : new Date(a.time).getTime();
      const tb = typeof b.time === "number" ? b.time : new Date(b.time).getTime();
      return ta - tb;
    });

    if (formatted.length === 0) return;

    // [핵심 로직 수정]
    // 처음 로드되거나, 데이터가 완전히 바뀐 경우(isLoadedRef가 false일 때)에만 setData 호출
    if (!isLoadedRef.current) {
      candleSeriesRef.current.setData(formatted as CandlestickData[]);
      chartRef.current.timeScale().fitContent(); // 줌 초기화
      isLoadedRef.current = true;
    } else {
      // 이미 로드된 상태라면 마지막 데이터만 update (줌 유지)
      const latestCandle = formatted[formatted.length - 1];
      candleSeriesRef.current.update(latestCandle as CandlestickData);
    }

  }, [candles, period]);

  return (
      <>
        <div ref={containerRef} style={{ width: "100%" }} />

        {/* MA Overlay */}
        {showMA && chartState && (
            <MAChart chart={chartState} indicators={maIndicators} />
        )}

        {/* Bollinger Overlay */}
        {showBollinger && chartState && (
            <BollingerChart chart={chartState} bollinger={bollinger} />
        )}
      </>
  );
}
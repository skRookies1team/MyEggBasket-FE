// stock/chart/PriceChart.tsx
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
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

    // 🔥 [수정 1] "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss" 변환
    // Safari 등 일부 브라우저는 공백이 있는 날짜 문자열을 new Date()로 파싱하지 못할 수 있음
    const d = new Date(str.replace(" ", "T"));
    return Math.floor(d.getTime() / 1000);
  }

  // 🔥 [수정 2] 공백(" ")이 포함된 날짜 문자열 처리 (일봉 전환 시 에러 방지)
  // 기존: if (str.includes("T")) return str.split("T")[0];
  if (str.includes("T")) return str.split("T")[0];
  if (str.includes(" ")) return str.split(" ")[0]; // "2025-12-30 11:10:00" -> "2025-12-30"

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

  // 1. onHover를 ref에 저장 (렌더링 됨에 따라 최신 함수를 가리키도록 함)
  const onHoverRef = useRef(onHover);

  // 2. onHover prop이 바뀔 때마다 ref 업데이트
  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  const [chartState, setChartState] = useState<IChartApi | null>(null);

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
        fixRightEdge: true,
      },
      crosshair: { mode: 1 },

      /* 🔑 드래그/휠 안정화 */
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
    setChartState(chart); // ✅ 렌더용

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

      // 3. 여기서 props로 받은 onHover 대신 ref.current를 사용
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

      // ⭐ ChartPanel에 반드시 알려야 함
      onChartDispose?.(chart);
      chart.remove();

      chartRef.current = null;
      candleSeriesRef.current = null;
      setChartState(null);
    };
  }, [height, onChartReady, onChartDispose]);

  /* ------------------ Data update ------------------ */
  useEffect(() => {
    if (!candleSeriesRef.current || !chartRef.current) return;

    // 1. 데이터를 먼저 정규화
    const normalized = candles.map((c) => ({
      ...c,
      time: normalizeTime(c.time, period),
    }));

    // 2. [추가] 중복 시간 제거 (Map 사용)
    // 동일한 시간(time) 키가 있으면 나중 데이터로 덮어씌워짐 -> 중복 제거 효과
    const uniqueDataMap = new Map();
    normalized.forEach((item) => {
      uniqueDataMap.set(item.time, item);
    });

    // 3. Map 값을 배열로 변환 후 정렬
    const formatted = Array.from(uniqueDataMap.values()).sort((a, b) => {
      const ta = typeof a.time === "number" ? a.time : new Date(a.time).getTime();
      const tb = typeof b.time === "number" ? b.time : new Date(b.time).getTime();
      return ta - tb;
    });

    candleSeriesRef.current.setData(
        formatted.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
    );

    if (formatted.length > 0) {
      chartRef.current.timeScale().fitContent();
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

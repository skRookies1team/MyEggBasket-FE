import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type CandlestickData,
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

  onHover?: (ohlc: HoverOHLC | null) => void;
  onChartReady?: (chart: IChartApi) => void;
  onChartDispose?: (chart: IChartApi) => void;
}

/* ------------------ time normalize ------------------ */
const normalizeTime = (time: string | number, period: Period): any => {
  if (typeof time === "number") return time;

  const str = String(time);

  if (period === "minute") {
    if (!isNaN(Number(str))) return Number(str);
    const d = new Date(str.replace(" ", "T"));
    // KST 보정 등 필요 시 로직 유지
    return Math.floor(d.getTime() / 1000) + 32400;
  }

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

  // 초기 줌 설정 여부 확인용
  const isLoadedRef = useRef(false);

  const onHoverRef = useRef(onHover);
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
        // 오른쪽 공간을 비우지 않고 꽉 채우거나, 여백을 주고 싶다면 rightOffset 사용
        fixRightEdge: true,
      },
      crosshair: { mode: 1 },
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

    const handleCrosshairMove = (param: any) => {
      if (!param?.time || !candleSeriesRef.current) {
        onHover?.(null);
        return;
      }
      const prices = param.seriesData.get(candleSeriesRef.current);
      if (prices) {
        onHoverRef.current?.({
          open: Number(prices.open),
          high: Number(prices.high),
          low: Number(prices.low),
          close: Number(prices.close),
        });
      } else {
        onHover?.(null);
      }
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
      isLoadedRef.current = false;
    };
  }, [height, onChartReady, onChartDispose]);

  /* ------------------ Period Change Reset ------------------ */
  // 기간이 변경되면 줌 상태를 리셋하여 다시 오른쪽 끝으로 이동하게 함
  useEffect(() => {
    isLoadedRef.current = false;
  }, [period]);

  /* ------------------ Data update ------------------ */
  useEffect(() => {
    if (!candleSeriesRef.current || !chartRef.current) return;
    if (candles.length === 0) return;

    // 1. 데이터 정규화
    const normalized = candles.map((c) => ({
      ...c,
      time: normalizeTime(c.time, period),
    }));

    // 2. 중복 제거 및 정렬
    const uniqueDataMap = new Map();
    normalized.forEach((item) => uniqueDataMap.set(item.time, item));
    const formatted = Array.from(uniqueDataMap.values()).sort((a, b) => {
      const ta = typeof a.time === "number" ? a.time : new Date(a.time).getTime();
      const tb = typeof b.time === "number" ? b.time : new Date(b.time).getTime();
      return ta - tb;
    });

    if (formatted.length === 0) return;

    // [수정 1] update() 대신 항상 setData() 사용
    // 기간 변경 시 데이터 포맷이 완전히 바뀌므로 update()를 쓰면 "Cannot update oldest data" 에러가 발생합니다.
    candleSeriesRef.current.setData(formatted as CandlestickData[]);

    // [수정 2] fitContent() 제거 및 setVisibleLogicalRange 사용
    // 최초 로드 시(혹은 기간 변경 시)에만 강제로 오른쪽 끝으로 줌을 이동
    if (!isLoadedRef.current) {
      const totalBars = formatted.length;
      const visibleRange = 100; // 한 화면에 보여줄 캔들 개수 (조절 가능)

      chartRef.current.timeScale().setVisibleLogicalRange({
        from: totalBars - visibleRange,
        to: totalBars,
      });

      isLoadedRef.current = true;
    }
    // 이미 로드된 상태에서는 setData만 호출해도 사용자가 보고 있는 줌/스크롤 위치가 유지됩니다.

  }, [candles, period]);

  return (
      <>
        <div ref={containerRef} style={{ width: "100%" }} />
        {showMA && chartState && <MAChart chart={chartState} indicators={maIndicators} />}
        {showBollinger && chartState && <BollingerChart chart={chartState} bollinger={bollinger} />}
      </>
  );
}
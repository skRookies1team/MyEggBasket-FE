// stock/chart/ChartPanel.tsx
import { useCallback, useMemo, useRef, useState } from "react";
import type { IChartApi, LogicalRange } from "lightweight-charts";

import type { Period, StockPriceData, StockCandle } from "../../../types/stock";
import type { IndicatorState, MAIndicator } from "../../../types/indicator";
import type { HoverOHLC } from "./PriceChart";

import { PriceChart } from "./PriceChart";
import { VolumeChart } from "./VolumeChart";
import { RSIChart } from "./RSIChart";
import { MACDChart } from "./MACDChart";
import { StochasticChart } from "./StochasticChart";

import { toCandle } from "../../../utils/chart/normalizeCandle";
import { calculateMA } from "../../../utils/indicators/ma";
import { calculateRSI } from "../../../utils/indicators/rsi";
import { calculateMACD } from "../../../utils/indicators/macd";
import { calculateBollinger } from "../../../utils/indicators/bollinger";
import { calculateStochastic } from "../../../utils/indicators/stochastic";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface Props {
  period: Period;
  indicators: IndicatorState;
  data?: StockPriceData[];
}

/* ------------------------------------------------------------------ */
/* TimeScale Sync Helper (🔥 jitter 방지 최종) */
/* ------------------------------------------------------------------ */
function syncTimeScale(charts: IChartApi[]) {
  const cleanups: (() => void)[] = [];
  let isSyncing = false;

  charts.forEach((source) => {
    const handler = (range: LogicalRange | null) => {
      if (!range || isSyncing) return;

      isSyncing = true;
      charts.forEach((target) => {
        if (target !== source) {
          try {
            target.timeScale().setVisibleLogicalRange(range);
          } catch {
            // disposed chart 접근 시 무시
          }
        }
      });
      isSyncing = false;
    };

    source.timeScale().subscribeVisibleLogicalRangeChange(handler);

    cleanups.push(() => {
      try {
        source.timeScale().unsubscribeVisibleLogicalRangeChange(handler);
      } catch {
        // chart가 이미 dispose된 경우 무시
      }
    });
  });

  return () => cleanups.forEach((fn) => fn());
}


/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function ChartPanel({
  period,
  indicators,
  data = [],
}: Props) {
  /* ------------------ normalize ------------------ */
  const candles: StockCandle[] = useMemo(
    () => (data.length ? toCandle(data) : []),
    [data]
  );

  /* ------------------ hover OHLC ------------------ */
  const [hoverOHLC, setHoverOHLC] = useState<HoverOHLC | null>(null);

  /* ------------------ chart registry ------------------ */
  const chartsRef = useRef<IChartApi[]>([]);
  const syncCleanupRef = useRef<(() => void) | null>(null);

  // 1. useCallback으로 감싸기
  const registerChart = useCallback((chart: IChartApi) => {
    if (chartsRef.current.includes(chart)) return;

    chartsRef.current.push(chart);

    // 🔑 chart 추가될 때만 sync 재설정
    syncCleanupRef.current?.();
    syncCleanupRef.current = syncTimeScale(chartsRef.current);
  }, []); // 의존성 배열 비움 (refs는 안정적임)

  // 2. useCallback으로 감싸기
  const unregisterChart = useCallback((chart: IChartApi) => {
    chartsRef.current = chartsRef.current.filter((c) => c !== chart);

    syncCleanupRef.current?.();
    syncCleanupRef.current = null;

    if (chartsRef.current.length >= 2) {
      syncCleanupRef.current = syncTimeScale(chartsRef.current);
    }
  }, []); // 의존성 배열 비움

  /* ------------------ indicator 계산 ------------------ */
  const maIndicators: MAIndicator[] = useMemo(
    () =>
      indicators.ma && candles.length
        ? [
          calculateMA(candles, 5),
          calculateMA(candles, 20),
          calculateMA(candles, 60),
        ]
        : [],
    [candles, indicators.ma]
  );

  const rsi = useMemo(
    () =>
      indicators.rsi && candles.length
        ? calculateRSI(candles, 14)
        : null,
    [candles, indicators.rsi]
  );

  const macd = useMemo(
    () =>
      indicators.macd && candles.length
        ? calculateMACD(candles)
        : null,
    [candles, indicators.macd]
  );

  const bollinger = useMemo(
    () =>
      indicators.bollinger && candles.length
        ? calculateBollinger(candles, 20, 2)
        : null,
    [candles, indicators.bollinger]
  );

  const stochastic = useMemo(
    () =>
      indicators.stochastic && candles.length
        ? calculateStochastic(candles, 14, 3)
        : null,
    [candles, indicators.stochastic]
  );

  if (!candles.length) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-gray-400">
        차트 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ===================== Price ===================== */}
      <div className="relative rounded-xl bg-[#0f0f17] p-3">
        {/* OHLC Overlay */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg bg-black/40 px-3 py-1 text-xs text-gray-200 backdrop-blur">
          {hoverOHLC ? (
            <div className="flex gap-3">
              <OhlcItem label="시가" value={hoverOHLC.open} />
              <OhlcItem label="고가" value={hoverOHLC.high} />
              <OhlcItem label="저가" value={hoverOHLC.low} />
              <OhlcItem label="종가" value={hoverOHLC.close} />
            </div>
          ) : (
            <span className="text-gray-400">
              차트에 마우스를 올리면 OHLC 표시
            </span>
          )}
        </div>

        <PriceChart
          candles={candles}
          period={period}
          showMA={indicators.ma}
          showBollinger={indicators.bollinger}
          maIndicators={maIndicators}
          bollinger={bollinger}
          height={420}
          onHover={setHoverOHLC}
          onChartReady={registerChart}
          onChartDispose={unregisterChart}
        />
      </div>

      {/* ===================== Volume ===================== */}
      <VolumeChart
        candles={candles}
        height={120}
        onChartReady={registerChart}
        onChartDispose={unregisterChart}
      />

      {/* ===================== RSI ===================== */}
      {indicators.rsi && rsi && (
        <RSIChart
          indicator={rsi}
          height={140}
          onChartReady={registerChart}
          onChartDispose={unregisterChart}
        />
      )}

      {/* ===================== MACD ===================== */}
      {indicators.macd && macd && (
        <MACDChart
          indicator={macd}
          height={160}
          onChartReady={registerChart}
          onChartDispose={unregisterChart}
        />
      )}

      {/* ===================== Stochastic ===================== */}
      {indicators.stochastic && stochastic && (
        <StochasticChart
          indicator={stochastic}
          height={140}
          onChartReady={registerChart}
          onChartDispose={unregisterChart}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OHLC Item */
/* ------------------------------------------------------------------ */
function OhlcItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <span className="flex gap-1">
      <span className="text-indigo-400">{label}</span>
      <span>{value.toLocaleString()}</span>
    </span>
  );
}

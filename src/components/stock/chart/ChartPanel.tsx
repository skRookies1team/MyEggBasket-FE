import { useMemo, useState } from "react";

import type { Period, StockPriceData, StockCandle } from "../../../types/stock";
import type {
  IndicatorState,
  MAIndicator,
} from "../../../types/indicator";
import type { HoverOHLC } from "./PriceChart";

import { PriceChart } from "./PriceChart";
import { RSIChart } from "./RSIChart";
import { MACDChart } from "./MACDChart";
import { StochasticChart } from "./StochasticChart";

import { toCandle } from "../../../utils/chart/normalizeCandle";
import { calculateMA } from "../../../utils/indicators/ma";
import { calculateRSI } from "../../../utils/indicators/rsi";
import { calculateMACD } from "../../../utils/indicators/macd";
import { calculateBollinger } from "../../../utils/indicators/bollinger";
import { calculateStochastic } from "../../../utils/indicators/stochastic";

interface Props {
  period: Period;
  indicators: IndicatorState;
  data?: StockPriceData[];
}

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
      {/* ===================== */}
      {/* Price Chart + OHLC */}
      {/* ===================== */}
      <div className="relative rounded-xl bg-[#0f0f17] p-3">
        {/* OHLC Overlay */}
        <div
          className="
            absolute left-3 top-3 z-10
            rounded-lg bg-black/40 px-3 py-1
            text-xs text-gray-200 backdrop-blur
          "
        >
          {hoverOHLC ? (
            <div className="flex gap-3">
              <OhlcItem label="O" value={hoverOHLC.open} />
              <OhlcItem label="H" value={hoverOHLC.high} />
              <OhlcItem label="L" value={hoverOHLC.low} />
              <OhlcItem label="C" value={hoverOHLC.close} />
            </div>
          ) : (
            <span className="text-gray-400">
              차트에 마우스를 올리면 OHLC 표시
            </span>
          )}
        </div>

        {/* Price Chart */}
        <PriceChart
          candles={candles}
          period={period}
          showMA={indicators.ma}
          showBollinger={indicators.bollinger}
          maIndicators={maIndicators}
          bollinger={bollinger}
          height={420}
          onHover={setHoverOHLC}
        />
      </div>

      {/* ===================== */}
      {/* RSI */}
      {/* ===================== */}
      {indicators.rsi && rsi && (
        <div className="rounded-xl bg-[#0f0f17] p-2">
          <RSIChart indicator={rsi} height={140} />
        </div>
      )}

      {/* ===================== */}
      {/* MACD */}
      {/* ===================== */}
      {indicators.macd && macd && (
        <div className="rounded-xl bg-[#0f0f17] p-2">
          <MACDChart indicator={macd} height={160} />
        </div>
      )}

      {/* ===================== */}
      {/* Stochastic */}
      {/* ===================== */}
      {indicators.stochastic && stochastic && (
        <div className="rounded-xl bg-[#0f0f17] p-2">
          <StochasticChart indicator={stochastic} height={140} />
        </div>
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

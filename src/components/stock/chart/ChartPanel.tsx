import { useMemo } from "react";

import type { Period, StockPriceData, StockCandle } from "../../../types/stock";
import type {
  IndicatorState,
  MAIndicator,
  RSIIndicator,
  MACDIndicator,
  BollingerIndicator,
  StochasticIndicator,
} from "../../../types/indicator";

import { PriceVolumeChart } from "./PriceChart";
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

  const rsi: RSIIndicator | null = useMemo(
    () =>
      indicators.rsi && candles.length
        ? calculateRSI(candles, 14)
        : null,
    [candles, indicators.rsi]
  );

  const macd: MACDIndicator | null = useMemo(
    () =>
      indicators.macd && candles.length
        ? calculateMACD(candles)
        : null,
    [candles, indicators.macd]
  );

  const bollinger: BollingerIndicator | null = useMemo(
    () =>
      indicators.bollinger && candles.length
        ? calculateBollinger(candles, 20, 2)
        : null,
    [candles, indicators.bollinger]
  );

  const stochastic: StochasticIndicator | null = useMemo(
    () =>
      indicators.stochastic && candles.length
        ? calculateStochastic(candles, 14, 3)
        : null,
    [candles, indicators.stochastic]
  );

  /* ------------------ guard ------------------ */
  if (!candles.length) {
    return <div className="chart-panel">차트 데이터가 없습니다.</div>;
  }

  /* ------------------ render ------------------ */
  return (
    <div className="chart-panel">
      {/* ===================== */}
      {/* Main Price Chart */}
      {/* ===================== */}
      <PriceVolumeChart
        candles={candles}
        period={period}
        showMA={indicators.ma}
        showBollinger={indicators.bollinger}
        maIndicators={maIndicators}
        bollinger={bollinger}
        height={420}
      />

      {/* ===================== */}
      {/* RSI */}
      {/* ===================== */}
      {indicators.rsi && rsi && (
        <RSIChart indicator={rsi} height={140} />
      )}

      {/* ===================== */}
      {/* MACD */}
      {/* ===================== */}
      {indicators.macd && macd && (
        <MACDChart indicator={macd} height={160} />
      )}

      {/* ===================== */}
      {/* Stochastic */}
      {/* ===================== */}
      {indicators.stochastic && stochastic && (
        <StochasticChart indicator={stochastic} height={140} />
      )}
    </div>
  );
}

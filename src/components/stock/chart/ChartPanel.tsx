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

import "../../../assets/Stock/ChartPanel.css";

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
    return <div className="chart-panel">차트 데이터가 없습니다.</div>;
  }

  return (
    <div className="chart-panel">
      {/* ===================== */}
      {/* Price Chart + OHLC */}
      {/* ===================== */}
      <div className="chart-canvas-wrapper">
        {/* OHLC Overlay */}
        <div className="ohlc-overlay">
          {hoverOHLC ? (
            <>
              <span>
                <span className="ohlc-label">O</span>
                <span className="ohlc-value">
                  {hoverOHLC.open.toLocaleString()}
                </span>
              </span>
              <span>
                <span className="ohlc-label">H</span>
                <span className="ohlc-value">
                  {hoverOHLC.high.toLocaleString()}
                </span>
              </span>
              <span>
                <span className="ohlc-label">L</span>
                <span className="ohlc-value">
                  {hoverOHLC.low.toLocaleString()}
                </span>
              </span>
              <span>
                <span className="ohlc-label">C</span>
                <span className="ohlc-value">
                  {hoverOHLC.close.toLocaleString()}
                </span>
              </span>
              <span>
                <span className="ohlc-label">V</span>
                <span className="ohlc-value">
                  {hoverOHLC.volume.toLocaleString()}
                </span>
              </span>
            </>
          ) : (
            <span className="ohlc-placeholder">
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

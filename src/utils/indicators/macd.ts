import type { StockCandle } from "../../types/stock";
import type {
  IndicatorPoint,
  MACDIndicator,
} from "../../types/indicator";

/**
 * EMA 계산 유틸
 */
function calculateEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];

  values.forEach((value, i) => {
    if (i === 0) ema.push(value);
    else ema.push(value * k + ema[i - 1] * (1 - k));
  });

  return ema;
}

/**
 * MACD 계산
 * - MACD Line = EMA(fast) - EMA(slow)
 * - Signal Line = EMA(MACD, signal)
 * - Histogram = MACD - Signal
 *
 * @param candles StockCandle[]
 * @param fast 단기 EMA (기본 12)
 * @param slow 장기 EMA (기본 26)
 * @param signal 시그널 EMA (기본 9)
 */
export function calculateMACD(
  candles: StockCandle[],
  fast = 12,
  slow = 26,
  signal = 9
): MACDIndicator {
  const closes = candles.map((c) => c.close);

  // EMA 계산
  const fastEma = calculateEMA(closes, fast);
  const slowEma = calculateEMA(closes, slow);

  // MACD 라인
  const macd: IndicatorPoint[] = candles.map((c, i) => ({
    time: c.time,
    value: +(fastEma[i] - slowEma[i]).toFixed(2),
  }));

  // Signal 라인
  const macdValues = macd.map((m) => m.value);
  const signalValues = calculateEMA(macdValues, signal);

  const signalLine: IndicatorPoint[] = candles.map((c, i) => ({
    time: c.time,
    value: +signalValues[i].toFixed(2),
  }));

  // Histogram
  const histogram: IndicatorPoint[] = candles.map((c, i) => ({
    time: c.time,
    value: +(macd[i].value - signalValues[i]).toFixed(2),
  }));

  return {
    fast,
    slow,
    signal,
    macd,
    signalLine,
    histogram,
  };
}

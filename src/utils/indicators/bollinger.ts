import type { StockCandle } from "../../types/stock";
import type {
  IndicatorPoint,
  BollingerIndicator,
  Band,
} from "../../types/indicator";

/**
 * Bollinger Bands 계산
 * - middle: 이동평균(SMA)
 * - upper / lower: 표준편차 기반
 */
export function calculateBollinger(
  candles: StockCandle[],
  period = 20,
  multiplier = 2
): BollingerIndicator {
  const upper: IndicatorPoint[] = [];
  const middle: IndicatorPoint[] = [];
  const lower: IndicatorPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);

    // 평균 (SMA)
    const mean =
      slice.reduce((sum, c) => sum + c.close, 0) / period;

    // 표준편차
    const variance =
      slice.reduce(
        (sum, c) => sum + Math.pow(c.close - mean, 2),
        0
      ) / period;

    const std = Math.sqrt(variance);
    const time = candles[i].time;

    middle.push({ time, value: +mean.toFixed(2) });
    upper.push({ time, value: +(mean + multiplier * std).toFixed(2) });
    lower.push({ time, value: +(mean - multiplier * std).toFixed(2) });
  }

  const band: Band = {
    upper,
    middle,
    lower,
  };

  return {
    period,
    band,
  };
}

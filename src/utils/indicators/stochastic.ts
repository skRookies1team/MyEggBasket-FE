import type { StockCandle } from "../../types/stock";
import type {
  IndicatorPoint,
  StochasticIndicator,
} from "../../types/indicator";

/**
 * Stochastic Oscillator
 * %K = (현재가 - 최근 N기간 최저가) / (최근 N기간 최고가 - 최저가) * 100
 * %D = %K의 이동평균
 */
export function calculateStochastic(
  candles: StockCandle[],
  kPeriod = 14,
  dPeriod = 3
): StochasticIndicator {
  const k: IndicatorPoint[] = [];
  const d: IndicatorPoint[] = [];

  // %K 계산
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kPeriod + 1, i + 1);

    const highestHigh = Math.max(...slice.map((c) => c.high));
    const lowestLow = Math.min(...slice.map((c) => c.low));

    const value =
      highestHigh === lowestLow
        ? 0
        : ((candles[i].close - lowestLow) /
            (highestHigh - lowestLow)) *
          100;

    k.push({
      time: candles[i].time,
      value: +value.toFixed(2),
    });
  }

  // %D = %K 이동평균
  for (let i = dPeriod - 1; i < k.length; i++) {
    const avg =
      k.slice(i - dPeriod + 1, i + 1)
        .reduce((sum, x) => sum + x.value, 0) / dPeriod;

    d.push({
      time: k[i].time,
      value: +avg.toFixed(2),
    });
  }

  return {
    kPeriod,
    dPeriod,
    k,
    d,
  };
}

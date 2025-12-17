import type { StockCandle } from "../../types/stock";
import type {
  IndicatorPoint,
  MAIndicator,
} from "../../types/indicator";

/**
 * 이동평균 (Simple Moving Average)
 */
export function calculateMA(
  candles: StockCandle[],
  period: number
): MAIndicator {
  const data: IndicatorPoint[] = candles
    .map((c, i) => {
      if (i < period - 1) return null;

      const sum = candles
        .slice(i - period + 1, i + 1)
        .reduce((acc, x) => acc + x.close, 0);

      return {
        time: c.time,
        value: +(sum / period).toFixed(2),
      };
    })
    .filter(Boolean) as IndicatorPoint[];

  return {
    period,
    data,
  };
}

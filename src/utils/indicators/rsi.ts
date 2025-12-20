import type { StockCandle } from "../../types/stock";
import type {
  IndicatorPoint,
  RSIIndicator,
} from "../../types/indicator";

/**
 * RSI (Relative Strength Index)
 */
export function calculateRSI(
  candles: StockCandle[],
  period = 14
): RSIIndicator {
  let gain = 0;
  let loss = 0;

  const data: IndicatorPoint[] = [];

  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;

    // 초기 period 구간
    if (i <= period) {
      if (diff > 0) {
        gain += diff;
      } else {
        loss -= diff;
      }
      continue;
    }

    gain = (gain * (period - 1) + Math.max(diff, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-diff, 0)) / period;

    const rs = loss === 0 ? 100 : gain / loss;
    const rsi = 100 - 100 / (1 + rs);

    data.push({
      time: candles[i].time,
      value: +rsi.toFixed(2),
    });
  }

  return {
    period,
    data,
  };
}

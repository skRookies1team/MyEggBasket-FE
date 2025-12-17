import type { StockPriceData, StockCandle } from "../../types/stock";

/**
 * StockPriceData → StockCandle 변환
 * (RSI, MACD 등 indicator 계산용)
 */
export function toCandle(
  data: StockPriceData[]
): StockCandle[] {
  return data
    .filter(
      (d): d is Required<StockPriceData> =>
        d.open !== undefined &&
        d.high !== undefined &&
        d.low !== undefined &&
        d.close !== undefined
    )
    .map((d) => ({
      time: String(d.time),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
}

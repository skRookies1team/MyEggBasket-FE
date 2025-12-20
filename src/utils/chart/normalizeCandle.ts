import type { StockPriceData, StockCandle } from "../../types/stock";

/**
 * StockPriceData → StockCandle 변환
 * (캔들 / RSI / MACD / Hover 공용 정규화)
 */
export function toCandle(
  data: StockPriceData[]
): StockCandle[] {
  return data
    .filter(
      (d): d is StockPriceData =>
        d.open !== undefined &&
        d.high !== undefined &&
        d.low !== undefined &&
        (d.close !== undefined || d.price !== undefined)
    )
    .map((d) => {
      const close = d.close ?? d.price!;

      return {
        time: String(d.time),
        open: d.open!,
        high: d.high!,
        low: d.low!,
        close, 
        volume: d.volume ?? 0,
      };
    });
}

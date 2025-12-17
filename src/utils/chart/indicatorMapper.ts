import type { StockCandle } from "../../types/stock";
import type {
  RSIIndicator,
  MACDIndicator,
} from "../../types/indicator";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */
export type CandleWithRSI = StockCandle & {
  rsi?: number;
};

export type CandleWithMACD = StockCandle & {
  macd?: number;
  signal?: number;
  histogram?: number;
};

/* ------------------------------------------------------------------ */
/* RSI merge */
/* ------------------------------------------------------------------ */
export function mergeRSI(
  candles: StockCandle[],
  rsi?: RSIIndicator
): CandleWithRSI[] {
  if (!rsi || !rsi.data || rsi.data.length === 0) {
    return candles;
  }

  const rsiMap = new Map<string, number>(
    rsi.data.map((d) => [String(d.time), d.value])
  );

  return candles.map((c) => ({
    ...c,
    rsi: rsiMap.get(String(c.time)),
  }));
}

/* ------------------------------------------------------------------ */
/* MACD merge */
/* ------------------------------------------------------------------ */
export function mergeMACD(
  candles: StockCandle[],
  macd?: MACDIndicator
): CandleWithMACD[] {
  if (!macd || !macd.data || macd.data.length === 0) {
    return candles;
  }

  const macdMap = new Map<
    string,
    { macd: number; signal: number; histogram: number }
  >(
    macd.data.map((d) => [
      String(d.time),
      {
        macd: d.macd,
        signal: d.signal,
        histogram: d.histogram,
      },
    ])
  );

  return candles.map((c) => {
    const v = macdMap.get(String(c.time));
    return {
      ...c,
      macd: v?.macd,
      signal: v?.signal,
      histogram: v?.histogram,
    };
  });
}

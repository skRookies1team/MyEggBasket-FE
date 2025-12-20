import type { StockCandle } from "../../types/stock";
import type {
  RSIIndicator,
  MACDIndicator,
  MAIndicator,
  StochasticIndicator,
} from "../../types/indicator";

import { normalizeTime } from "../../components/stock/chart/utils";

/* ------------------------------------------------------------------ */
/* Types
/* ------------------------------------------------------------------ */
export type CandleWithIndicators = StockCandle & {
  rsi?: number;

  macd?: number;
  signal?: number;
  histogram?: number;

  ma?: Record<number, number>; // period → value

  stochasticK?: number;
  stochasticD?: number;
};

/* ------------------------------------------------------------------ */
/* RSI merge
/* ------------------------------------------------------------------ */
export function mergeRSI(
  candles: StockCandle[],
  rsi?: RSIIndicator
): CandleWithIndicators[] {
  if (!rsi?.data?.length) return candles;

  const rsiMap = new Map<number, number>(
    rsi.data.map((d) => [
      normalizeTime(d.time),
      d.value,
    ])
  );

  return candles.map((c) => ({
    ...c,
    rsi: rsiMap.get(normalizeTime(c.time)),
  }));
}

/* ------------------------------------------------------------------ */
/* MACD merge
/* ------------------------------------------------------------------ */
export function mergeMACD(
  candles: StockCandle[],
  macd?: MACDIndicator
): CandleWithIndicators[] {
  if (
    !macd ||
    !macd.macd?.length ||
    !macd.signalLine?.length ||
    !macd.histogram?.length
  ) {
    return candles;
  }

  const macdMap = new Map<
    number,
    { macd?: number; signal?: number; histogram?: number }
  >();

  macd.macd.forEach((p) => {
    macdMap.set(normalizeTime(p.time), {
      macd: p.value,
    });
  });

  macd.signalLine.forEach((p) => {
    const t = normalizeTime(p.time);
    macdMap.set(t, {
      ...macdMap.get(t),
      signal: p.value,
    });
  });

  macd.histogram.forEach((p) => {
    const t = normalizeTime(p.time);
    macdMap.set(t, {
      ...macdMap.get(t),
      histogram: p.value,
    });
  });

  return candles.map((c) => {
    const v = macdMap.get(normalizeTime(c.time));
    return {
      ...c,
      macd: v?.macd,
      signal: v?.signal,
      histogram: v?.histogram,
    };
  });
}

/* ------------------------------------------------------------------ */
/* MA merge (multiple periods)
/* ------------------------------------------------------------------ */
export function mergeMA(
  candles: StockCandle[],
  mas?: MAIndicator[]
): CandleWithIndicators[] {
  if (!mas || mas.length === 0) return candles;

  const maMaps = new Map<number, Map<number, number>>();

  mas.forEach((ma) => {
    maMaps.set(
      ma.period,
      new Map(
        ma.data.map((d) => [
          normalizeTime(d.time),
          d.value,
        ])
      )
    );
  });

  return candles.map((c) => {
    const time = normalizeTime(c.time);
    const maValues: Record<number, number> = {};

    maMaps.forEach((map, period) => {
      const v = map.get(time);
      if (v !== undefined) {
        maValues[period] = v;
      }
    });

    return {
      ...c,
      ma: Object.keys(maValues).length
        ? maValues
        : undefined,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Stochastic merge
/* ------------------------------------------------------------------ */
export function mergeStochastic(
  candles: StockCandle[],
  stochastic?: StochasticIndicator
): CandleWithIndicators[] {
  if (!stochastic?.k?.length || !stochastic?.d?.length) {
    return candles;
  }

  const kMap = new Map<number, number>(
    stochastic.k.map((d) => [
      normalizeTime(d.time),
      d.value,
    ])
  );

  const dMap = new Map<number, number>(
    stochastic.d.map((d) => [
      normalizeTime(d.time),
      d.value,
    ])
  );

  return candles.map((c) => {
    const time = normalizeTime(c.time);
    return {
      ...c,
      stochasticK: kMap.get(time),
      stochasticD: dMap.get(time),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Full merge helper
/* ------------------------------------------------------------------ */
export function mergeIndicators(
  candles: StockCandle[],
  params: {
    rsi?: RSIIndicator;
    macd?: MACDIndicator;
    ma?: MAIndicator[];
    stochastic?: StochasticIndicator;
  }
): CandleWithIndicators[] {
  let result: CandleWithIndicators[] = candles;

  result = mergeRSI(result, params.rsi);
  result = mergeMACD(result, params.macd);
  result = mergeMA(result, params.ma);
  result = mergeStochastic(result, params.stochastic);

  return result;
}

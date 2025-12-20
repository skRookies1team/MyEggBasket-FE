/* ------------------------------------------------------------------ */
/* Base
/* ------------------------------------------------------------------ */
export interface IndicatorPoint {
  time: string | number; 
  value: number;
}

/* ------------------------------------------------------------------ */
/* Moving Average
/* ------------------------------------------------------------------ */
export interface MAIndicator {
  period: number;
  data: IndicatorPoint[];
}

/* ------------------------------------------------------------------ */
/* Bollinger Bands
/* ------------------------------------------------------------------ */
export interface Band {
  upper: IndicatorPoint[];
  middle: IndicatorPoint[];
  lower: IndicatorPoint[];
}

export interface BollingerIndicator {
  period: number;
  band: Band;
}

/* ------------------------------------------------------------------ */
/* RSI
/* ------------------------------------------------------------------ */
export interface RSIIndicator {
  period: number;
  data: IndicatorPoint[];
}

/* ------------------------------------------------------------------ */
/* Stochastic
/* ------------------------------------------------------------------ */
export interface StochasticIndicator {
  kPeriod: number;
  dPeriod: number;
  k: IndicatorPoint[];
  d: IndicatorPoint[];
}

/* ------------------------------------------------------------------ */
/* MACD (정석 구조)
/* ------------------------------------------------------------------ */
export interface MACDIndicator {
  fast: number;
  slow: number;
  signal: number;

  macd: IndicatorPoint[];
  signalLine: IndicatorPoint[];
  histogram: IndicatorPoint[];
}

/* ------------------------------------------------------------------ */
/* Volume Profile
/* ------------------------------------------------------------------ */
export interface VolumeProfile {
  price: number;
  volume: number;
}

/* ------------------------------------------------------------------ */
/* Indicator Toggle State
/* ------------------------------------------------------------------ */
export interface IndicatorState {
  ma: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
  stochastic: boolean;
}

export interface IndicatorPoint {
  time: string;
  value: number;
}

export interface Band {
  upper: IndicatorPoint[];
  middle: IndicatorPoint[];
  lower: IndicatorPoint[];
}

export interface MAIndicator {
  period: number;
  data: IndicatorPoint[];
}

export interface BollingerIndicator {
  period: number;
  band: Band;
}

export interface RSIIndicator {
  period: number;
  data: IndicatorPoint[];
}

export interface StochasticIndicator {
  kPeriod: number;
  dPeriod: number;
  k: IndicatorPoint[];
  d: IndicatorPoint[];
}

export interface MACDIndicator {
  fast: number;
  slow: number;
  signal: number;
  macd: IndicatorPoint[];
  signalLine: IndicatorPoint[];
  histogram: IndicatorPoint[];
}

export interface VolumeProfile {
  price: number;
  volume: number;
}

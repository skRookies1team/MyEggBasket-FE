// src/components/stock/StockChart.tsx
import { useState, useMemo } from "react";

import type { StockPriceData } from "../../types/stock";
import type { IndicatorKey } from "../stock/chart/IndicatorToggle";

import { PriceVolumeChart } from "./chart/PriceChart";
import { RSIChart } from "./chart/RSIChart";
import { MACDChart } from "./chart/MACDChart";
import { StochasticChart } from "./chart/StochasticChart";

import { IndicatorToggle } from "../stock/chart/IndicatorToggle";

import { toCandle } from "../../utils/chart/normalizeCandle";
import { calculateRSI } from "../../utils/indicators/rsi";
import { calculateMA } from "../../utils/indicators/ma";
import { calculateMACD } from "../../utils/indicators/macd";
import { calculateBollinger } from "../../utils/indicators";
import { calculateStochastic } from "../../utils/indicators";

import {
    mergeRSI,
    mergeMACD
} from "../../utils/chart/indicatorMapper";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */
interface StockChartProps {
    data: StockPriceData[];
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function StockChart({ data }: StockChartProps) {
    /* ------------------ hooks (항상 실행) ------------------ */
    const [enabled, setEnabled] = useState<IndicatorKey[]>(["price"]);

    const candles = useMemo(
        () => (data?.length ? toCandle(data) : []),
        [data]
    );

    const rsi = useMemo(
        () => (candles.length ? calculateRSI(candles, 14) : null),
        [candles]
    );

    const maIndicators = useMemo(
        () =>
            candles.length
                ? [
                    calculateMA(candles, 5),
                    calculateMA(candles, 20),
                    calculateMA(candles, 60),
                ]
                : [],
        [candles]
    );

    const macd = useMemo(
        () => (candles.length ? calculateMACD(candles) : null),
        [candles]
    );

    const rsiData = useMemo(
        () => (rsi ? mergeRSI(candles, rsi) : []),
        [candles, rsi]
    );

    const macdData = useMemo(
        () => (macd ? mergeMACD(candles, macd) : []),
        [candles, macd]
    );

    const bollinger = useMemo(
        () =>
            candles.length
                ? calculateBollinger(candles, 20, 2)
                : null,
        [candles]
    );

    const stochastic = useMemo(
        () =>
            candles.length
                ? calculateStochastic(candles, 14, 3)
                : null,
        [candles]
    );

    /* ------------------ early return (이제 안전) ------------------ */
    if (!data?.length) {
        return <div style={{ padding: 16 }}>차트 데이터가 없습니다.</div>;
    }

    if (candles.length === 0) {
        return <div style={{ padding: 16 }}>캔들 데이터가 없습니다.</div>;
    }

    /* ------------------ render ------------------ */
    return (
        <div style={{ width: "100%" }}>
            {/* 지표 토글 */}
            <IndicatorToggle
                enabled={enabled}
                onChange={setEnabled}
            />

            {/* 가격 + 거래량 */}
            {enabled.includes("price") && (
                <PriceVolumeChart
                    data={data}
                    maIndicators={enabled.includes("ma") ? maIndicators : []}
                    bollinger={enabled.includes("bollinger") ? bollinger : null}
                    height={420}
                />
            )}

            {/* RSI */}
            {enabled.includes("rsi") && (
                <RSIChart data={rsiData} height={140} />
            )}

            {/* MACD */}
            {enabled.includes("macd") && (
                <MACDChart data={macdData} height={160} />
            )}

            {/* Stochastic */}
            {enabled.includes("stochastic") && stochastic && (
                <StochasticChart data={stochastic} height={140} />
            )}
        </div>
    );
}

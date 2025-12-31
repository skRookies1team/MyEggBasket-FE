// stock/chart/BollingerChart.tsx
import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

import type {
  IChartApi,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";

import type { BollingerIndicator } from "../../../types/indicator";
import { normalizeTime } from "./utils";

interface Props {
  chart: IChartApi | null;
  bollinger: BollingerIndicator | null;
}

export function BollingerChart({ chart, bollinger }: Props) {
  const seriesRef = useRef<{
    upper?: ISeriesApi<"Line">;
    middle?: ISeriesApi<"Line">;
    lower?: ISeriesApi<"Line">;
  }>({});

  useEffect(() => {
    if (!chart) return;

    // 기존 Bollinger 제거 (안전하게)
    try {
      Object.values(seriesRef.current).forEach((s) => {
        if (s) chart.removeSeries(s);
      });
    } catch (e) {
      // 차트가 이미 삭제된 경우 무시
    }
    seriesRef.current = {};

    if (!bollinger) return;

    try {
      const { upper, middle, lower } = bollinger.band;

      const upperSeries = chart.addSeries(LineSeries, {
        color: "rgba(99,102,241,0.9)",
        lineWidth: 1,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });

      const middleSeries = chart.addSeries(LineSeries, {
        color: "rgba(99,102,241,0.6)",
        lineWidth: 1,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });

      const lowerSeries = chart.addSeries(LineSeries, {
        color: "rgba(99,102,241,0.9)",
        lineWidth: 1,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });

      const toLineData = (
          data: { time: any; value: number }[]
      ): LineData<UTCTimestamp>[] =>
          data.map((d) => ({
            time: normalizeTime(d.time),
            value: d.value,
          }));

      upperSeries.setData(toLineData(upper));
      middleSeries.setData(toLineData(middle));
      lowerSeries.setData(toLineData(lower));

      seriesRef.current = {
        upper: upperSeries,
        middle: middleSeries,
        lower: lowerSeries,
      };
    } catch (e) {
      // 차트 시리즈 추가 실패 시 무시
    }

    // cleanup
    return () => {
      try {
        Object.values(seriesRef.current).forEach((s) => {
          if (s) chart.removeSeries(s);
        });
      } catch (e) {
        // 이미 차트가 remove() 된 상태라면 에러 무시
      }
      seriesRef.current = {};
    };
  }, [chart, bollinger]);

  return null; // 렌더 UI 없음
}
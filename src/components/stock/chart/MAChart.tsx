// stock/chart/MAChart.tsx
import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

import type {
  IChartApi,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";

import type { MAIndicator } from "../../../types/indicator";
import { normalizeTime } from "./utils";

interface MAChartProps {
  chart: IChartApi | null;
  indicators: MAIndicator[];
}

export function MAChart({ chart, indicators }: MAChartProps) {
  const seriesRef = useRef<ISeriesApi<"Line">[]>([]);

  useEffect(() => {
    if (!chart) return;

    // 기존 MA 제거 (안전하게)
    try {
      seriesRef.current.forEach((s) => chart.removeSeries(s));
    } catch (e) {
      // 차트가 이미 삭제된 경우 무시
    }
    seriesRef.current = [];

    if (!indicators || indicators.length === 0) return;

    indicators.forEach((ma) => {
      // 차트가 유효한지 확인 후 추가
      try {
        const series = chart.addSeries(LineSeries, {
          lineWidth: 2,
          color: getMAColor(ma.period),
          priceLineVisible: false,
          crosshairMarkerVisible: false,
        });

        const data: LineData<UTCTimestamp>[] = ma.data.map(
            (d) => ({
              time: normalizeTime(d.time),
              value: d.value,
            })
        );

        series.setData(data);
        seriesRef.current.push(series);
      } catch (e) {
        // 차트 생성 중 에러 무시
      }
    });

    return () => {
      // Cleanup: 차트가 삭제된 후에도 실행될 수 있으므로 try-catch 필수
      try {
        seriesRef.current.forEach((s) => chart.removeSeries(s));
      } catch (e) {
        // 이미 차트가 remove() 된 상태라면 에러 무시
      }
      seriesRef.current = [];
    };
  }, [chart, indicators]);

  return null;
}

function getMAColor(period: number) {
  switch (period) {
    case 5:
      return "#22c55e";
    case 20:
      return "#eab308";
    case 60:
      return "#f97316";
    case 120:
      return "#ef4444";
    default:
      return "#a855f7";
  }
}
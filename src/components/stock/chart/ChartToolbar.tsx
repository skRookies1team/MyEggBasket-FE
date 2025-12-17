import type { Period } from "../../../types/stock";
import type { IndicatorState } from "../../../types/indicator";

import { IndicatorToggle } from "./IndicatorToggle";

interface Props {
  period: Period;
  onPeriodChange: (p: Period) => void;

  indicators: IndicatorState;
  onIndicatorChange: (next: IndicatorState) => void;
}

export function ChartToolbar({
  period,
  onPeriodChange,
  indicators,
  onIndicatorChange,
}: Props) {
  return (
    <div className="chart-toolbar">
      {/* 기간 탭 */}
      <div className="period-tabs">
        {(["minute", "day", "week", "month", "year"] as Period[]).map((p) => (
          <button
            key={p}
            className={period === p ? "active" : ""}
            onClick={() => onPeriodChange(p)}
          >
            {p === "minute" && "분"}
            {p === "day" && "일"}
            {p === "week" && "주"}
            {p === "month" && "월"}
            {p === "year" && "년"}
          </button>
        ))}
      </div>

      {/* 보조지표 버튼 */}
      <IndicatorToggle
        indicators={indicators}
        onChange={onIndicatorChange}
      />
    </div>
  );
}

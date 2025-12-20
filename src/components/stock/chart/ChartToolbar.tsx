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
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* ===================== */}
      {/* 기간 탭 */}
      {/* ===================== */}
      <div className="flex rounded-lg bg-[#0f0f17] p-1">
        {(["minute", "day", "week", "month", "year"] as Period[]).map((p) => {
          const active = period === p;

          return (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`
                px-4 py-1.5 text-sm rounded-md transition-all
                ${
                  active
                    ? "bg-indigo-500/20 text-indigo-300 font-semibold shadow-inner"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }
              `}
            >
              {p === "minute" && "분"}
              {p === "day" && "일"}
              {p === "week" && "주"}
              {p === "month" && "월"}
              {p === "year" && "년"}
            </button>
          );
        })}
      </div>

      {/* ===================== */}
      {/* 보조지표 토글 */}
      {/* ===================== */}
      <IndicatorToggle
        indicators={indicators}
        onChange={onIndicatorChange}
      />
    </div>
  );
}

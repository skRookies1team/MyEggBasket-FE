import type { HistoryReport as HistoryReportType } from "../../types/portfolios";

interface Props {
  history: HistoryReportType | undefined;
}

export default function HistoryReport({ history }: Props) {
  if (!history) {
    return (
      <p className="text-sm text-gray-400">
        거래 기록 데이터를 불러오는 중입니다...
      </p>
    );
  }

  const totalReturnRate =
    history.totalReturnRate?.toFixed(2) ?? "0.00";
  const successRate =
    history.successRate?.toFixed(2) ?? "0.00";

  const isPositive = Number(totalReturnRate) >= 0;

  return (
    <div className="mt-6 border-t border-[#232332] pt-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-100">
        거래 기록 분석
      </h3>

      <div className="space-y-3">
        {/* 전체 수익률 */}
        <div className="flex items-center justify-between rounded-xl bg-[#1f1f2e] px-5 py-4">
          <span className="text-sm text-gray-400">
            전체 수익률 (Total Return)
          </span>
          <span
            className={`text-xl font-bold tabular-nums ${
              isPositive ? "text-red-400" : "text-blue-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {totalReturnRate}%
          </span>
        </div>

        {/* AI 성공률 */}
        <div className="flex items-center justify-between rounded-xl bg-[#1f1f2e] px-5 py-4">
          <span className="text-sm text-gray-400">
            AI 사용 시 성공률 (Win Rate)
          </span>
          <span className="text-xl font-bold tabular-nums text-indigo-400">
            {successRate}%
          </span>
        </div>
      </div>
    </div>
  );
}

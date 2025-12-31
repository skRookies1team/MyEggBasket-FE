import { DollarSign } from "lucide-react";

interface MyAssets {
  total: number;
  totalCash: number;
  D1Cash: number;
  D2Cash: number;
  profit: number;
  profitRate: number;
  stockEval: number;
}

interface AssetSummaryProps {
  assetData: MyAssets;
  loading: boolean;
}

export function ProtfolioSummary({
  assetData,
  loading,
}: AssetSummaryProps) {
  if (!assetData) return null;

  const { profit, profitRate, stockEval } = assetData;
  const isPositive = profit >= 0;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-purple-400" />
        <h2 className="text-sm font-semibold tracking-wide text-purple-300">
          내 자산 현황
        </h2>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Stock Evaluation */}
        <div className="rounded-xl bg-[#1f1f2e] p-4">
          <p className="mb-1 text-xs text-gray-400">
            주식 평가금액
          </p>
          <p className="text-lg font-semibold text-white">
            {loading
              ? "-"
              : `₩${stockEval.toLocaleString()}`}
          </p>
        </div>

        {/* Profit / Rate */}
        <div className="rounded-xl bg-[#1f1f2e] p-4">
          <p className="mb-1 text-xs text-gray-400">
            총 수익 / 수익률
          </p>

          {loading ? (
            <p className="text-lg font-semibold text-gray-400">
              -
            </p>
          ) : (
            <p
              className={`text-lg font-semibold ${
                isPositive
                  ? "text-red-400"
                  : "text-blue-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {profit.toLocaleString()}
              <span className="ml-2 text-sm font-medium opacity-80">
                ({profitRate >= 0 ? "+" : ""}
                {profitRate.toFixed(2)}%)
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

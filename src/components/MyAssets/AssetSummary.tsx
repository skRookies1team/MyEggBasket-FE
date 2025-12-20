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

export function AssetSummary({ assetData, loading }: AssetSummaryProps) {
  if (!assetData) return null;

  const {
    total,
    totalCash,
    D1Cash,
    D2Cash,
    profit,
    profitRate,
    stockEval,
  } = assetData;

  const isProfit = profit >= 0;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c]
                    p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-indigo-400" />
        <h2 className="text-sm font-semibold tracking-wide text-indigo-300">
          내 자산 현황
        </h2>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 총 자산 */}
        <SummaryCard label="총 자산">
          {loading ? "-" : `₩${total.toLocaleString()}`}
        </SummaryCard>

        {/* 총 수익 / 수익률 */}
        <SummaryCard label="총 수익 / 수익률">
          {loading ? (
            "-"
          ) : (
            <span
              className={`font-semibold ${
                isProfit ? "text-red-400" : "text-blue-400"
              }`}
            >
              {isProfit ? "+" : ""}
              {profit.toLocaleString()}
              <span className="ml-2 text-sm opacity-80">
                ({profitRate >= 0 ? "+" : ""}
                {profitRate.toFixed(2)}%)
              </span>
            </span>
          )}
        </SummaryCard>

        {/* 주식 평가금액 */}
        <SummaryCard label="주식 평가금액">
          {loading ? "-" : `₩${stockEval.toLocaleString()}`}
        </SummaryCard>

        {/* 예수금 */}
        <div className="rounded-xl bg-[#1f1f2e] p-4">
          <p className="mb-1 text-xs text-gray-400">
            예수금 (주문 가능)
          </p>
          <p className="mb-3 text-lg font-semibold text-white">
            {loading ? "-" : `₩${totalCash.toLocaleString()}`}
          </p>

          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>D+1 예수금</span>
              <span>
                {loading ? "-" : `₩${D1Cash.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>D+2 예수금</span>
              <span>
                {loading ? "-" : `₩${D2Cash.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Small UI Component ---------------- */

function SummaryCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#1f1f2e] p-4">
      <p className="mb-1 text-xs text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-white">
        {children}
      </p>
    </div>
  );
}

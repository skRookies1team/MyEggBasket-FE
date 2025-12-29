import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

interface StockHeaderProps {
  stockName: string;
  currentPrice: number;
  changeAmount: number;
  changeRate: number;

  onBack: () => void;

  isLive?: boolean;
  lastUpdate?: string;
  askp1?: number;
  bidp1?: number;
  acmlVol?: number;
}

export function StockHeader({
  stockName,
  currentPrice,
  changeAmount,
  changeRate,
  onBack,
  isLive = false,
  lastUpdate,
  askp1,
  bidp1,
  acmlVol,
}: StockHeaderProps) {
  const safeNum = (v?: number) =>
    typeof v === "number" && Number.isFinite(v) ? v : 0;

  const isPositive = safeNum(changeAmount) >= 0;
  const ColorIcon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-red-400" : "text-blue-400";

  return (
    <header className="border-b border-[#232332] bg-gradient-to-b from-[#14141c] to-[#0a0a0f]">
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="flex items-start gap-4">
          {/* ===================== */}
          {/* Back Button */}
          {/* ===================== */}
          <button
            onClick={onBack}
            className="mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-[#1f1f2e] hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* ⬇️ Nav에 가려지지 않도록 margin-top 추가 */}
          <div className="flex-1 mt-14 md:mt-3">
            {/* Stock Name */}
            <h1 className="mb-2 text-xl font-semibold text-gray-100">
              {stockName}
            </h1>

            {/* Price & Change */}
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-2xl font-bold text-gray-100 tabular-nums">
                ₩{safeNum(currentPrice).toLocaleString()}
              </p>

              <div className={`flex items-center gap-2 ${colorClass}`}>
                <ColorIcon className="h-5 w-5" />
                <span className="font-medium tabular-nums">
                  {isPositive ? "+" : ""}
                  {safeNum(changeAmount).toLocaleString()} (
                  {isPositive ? "+" : ""}
                  {safeNum(changeRate)}%)
                </span>
              </div>

              {/* LIVE */}
              {isLive && (
                <div className="ml-2 flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  LIVE
                  {lastUpdate && (
                    <span className="ml-1 text-xs text-gray-400">
                      {new Date(lastUpdate).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Extra Info */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
              {askp1 !== undefined && (
                <span>
                  매도1:{" "}
                  <span className="tabular-nums text-gray-300">
                    ₩{safeNum(askp1).toLocaleString()}
                  </span>
                </span>
              )}
              {bidp1 !== undefined && (
                <span>
                  매수1:{" "}
                  <span className="tabular-nums text-gray-300">
                    ₩{safeNum(bidp1).toLocaleString()}
                  </span>
                </span>
              )}
              {acmlVol !== undefined && (
                <span>
                  누적거래량:{" "}
                  <span className="tabular-nums text-gray-300">
                    {safeNum(acmlVol).toLocaleString()}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

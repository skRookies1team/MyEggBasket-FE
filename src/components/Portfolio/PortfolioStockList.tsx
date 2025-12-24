import type { Holding } from "../../types/portfolios";
import { AIRebalancingBadge } from "../Portfolio/AIRebalancingBadge";
import { useAIRecommendationStore } from "../../store/aiRecommendationStore";

interface PortfolioStockListProps {
  stocks?: Holding[] | null;
  title?: string;
}

export function PortfolioStockList({
  stocks,
  title = "보유 종목 상세",
}: PortfolioStockListProps) {
  const { recommendations } = useAIRecommendationStore();

  if (!stocks || stocks.length === 0) return null;

  return (
    <div className="mt-6 border-t border-[#2a2a3a] pt-6">
      {/* Section Title */}
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-indigo-300">
        {title}
      </h3>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stocks.map((holding) => {
          const stockCode = holding.stock.stockCode;

          const stockRecommendations = recommendations.filter(
            (r) => r.stockCode === stockCode
          );

          return (
            <div
              key={stockCode}
              className="flex h-full flex-col rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
            >
              {/* ===== Header ===== */}
              <div className="mb-3">
                <p className="text-sm font-semibold text-white">
                  {holding.stock.name}
                </p>
                <p className="text-xs text-gray-400">
                  {stockCode}
                </p>
              </div>

              {/* ===== Stock Info ===== */}
              <div className="flex-1 rounded-xl bg-[#1f1f2e] p-4 text-sm text-gray-300">
                <div className="grid grid-cols-2 gap-y-2">
                  <div>보유 수량</div>
                  <div className="text-right font-medium text-white">
                    {holding.quantity}주
                  </div>

                  <div>평균 단가</div>
                  <div className="text-right font-medium text-white">
                    ₩{holding.avgPrice.toLocaleString()}
                  </div>

                  <div>평가 금액</div>
                  <div className="text-right font-medium text-white">
                    ₩
                    {(holding.quantity * holding.avgPrice).toLocaleString()}
                  </div>

                  <div>수익률</div>
                  <div
                    className={`text-right font-semibold ${
                      holding.profitRate >= 0
                        ? "text-red-400"
                        : "text-blue-400"
                    }`}
                  >
                    {holding.profitRate >= 0 ? "+" : ""}
                    {(holding.profitRate * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* ===== AI Rebalancing ===== */}
              <div className="mt-4 flex items-center justify-between border-t border-[#2a2a3a] pt-3">
                <p className="text-xs font-medium text-indigo-300">
                  AI 리밸런싱 판단
                </p>

                <AIRebalancingBadge
                  recommendations={stockRecommendations}
                  onClick={() => {
                    // TODO: AI 추천 상세 모달
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

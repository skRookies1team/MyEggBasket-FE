import type { Holding } from "../../types/portfolios";
import { AIRebalancingBadge } from "../Portfolio/AIRebalancingBadge";
import { useAIRecommendationStore } from "../../store/aiRecommendationStore";
import type {AiRecommendation} from "../../pages/PortfolioPage";

import RefreshIcon from "@mui/icons-material/Refresh";
import type {AccountBalanceData} from "../../types/stock.ts";

interface PortfolioStockListProps {
  stocks?: Holding[] | null;
  title?: string;
  aiAnalysisMap?: Record<string, AiRecommendation>;
  balanceData?: AccountBalanceData | null; // [추가]
}

export function PortfolioStockList({
                                       stocks,
                                       title = "보유 종목 상세",
                                       aiAnalysisMap = {},
                                       balanceData,
                                   }: PortfolioStockListProps) {

    if (!stocks || stocks.length === 0) return null;

    // 총 평가 금액 (비중 계산용)
    // balanceData.summary가 있으면 그것을, 없으면 stocks의 합산으로 추정
    let totalEval = 0;
    if (balanceData?.summary?.totalStockEvaluationAmount) {
        totalEval = balanceData.summary.totalStockEvaluationAmount;
    } else {
        // balanceData 로딩 전이거나 없을 경우 avgPrice 기반 추정 (정확도 낮음)
        totalEval = stocks.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0);
    }

    return (
        <div className="mt-6 border-t border-[#2a2a3a] pt-6">
            {/* ===== Section Header ===== */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-purple-300">
                    {title}
                </h3>
                {/* API 재호출 버튼 제거 혹은 부모에서 refresh 함수 받아와서 처리 가능 */}
            </div>

            {/* ===== Grid Layout ===== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stocks.map((holding) => {
                    const stockCode = holding.stock.stockCode;
                    const aiData = aiAnalysisMap[stockCode];

                    // 실시간 평가금액 찾기
                    const balanceItem = balanceData?.holdings?.find(
                        (b) => b.stockCode === stockCode
                    );

                    const currentEval = balanceItem
                        ? balanceItem.evaluationAmount
                        : holding.avgPrice * holding.quantity;

                    // [수정] 현재 비중 계산 (소수점 2자리)
                    const currentWeight = totalEval > 0
                        ? (currentEval / totalEval) * 100
                        : 0;

                    // 수익률 계산
                    let profitRate = holding.profitRate;
                    if (balanceItem && balanceItem.evaluationAmount > 0) {
                        const invested = holding.avgPrice * holding.quantity;
                        if (invested > 0) {
                            profitRate = (balanceItem.evaluationAmount - invested) / invested;
                        }
                    }

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
                                <p className="text-xs text-gray-400">{stockCode}</p>
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
                                        ₩{currentEval.toLocaleString()}
                                    </div>

                                    <div>수익률</div>
                                    <div
                                        className={`text-right font-semibold ${
                                            profitRate >= 0
                                                ? "text-red-400"
                                                : "text-blue-400"
                                        }`}
                                    >
                                        {profitRate >= 0 ? "+" : ""}
                                        {(profitRate * 100).toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            {/* ===== AI Rebalancing ===== */}
                            <div className="mt-4 flex items-center justify-between border-t border-[#2a2a3a] pt-3">
                                <p className="text-xs font-medium text-purple-300">
                                    AI 포트폴리오 판단
                                </p>

                                <AIRebalancingBadge
                                    recommendation={aiData} // 단일 객체 전달
                                    currentWeight={currentWeight} // [수정] 계산된 현재 비중 전달
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
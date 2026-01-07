import { useEffect, useState } from "react";
import type { HistoryReport as HistoryReportType } from "../../types/portfolios";

interface Props {
  history: HistoryReportType | undefined;
}

export default function HistoryReport({ history }: Props) {
  // JSON 파일에서 계산된 통계 데이터를 저장할 상태
  const [stats, setStats] = useState<{ totalReturn: string; successRate: string } | null>(null);

  useEffect(() => {
    async function calculateStatsFromJson() {
      try {
        // 1. JSON 데이터 로드 (캐시 방지)
        const response = await fetch(`/data/trade_record.json?t=${new Date().getTime()}`);
        if (!response.ok) return;

        const trades = await response.json();
        if (!trades || trades.length === 0) return;

        // 2. 시간순 정렬
        const sortedTrades = trades.sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // 3. 통계 계산 변수
        let totalSellCount = 0;
        let successCount = 0;

        let cumulativeInvested = 0; // 누적 매수 금액
        let cumulativeProfit = 0;   // 누적 실현 손익

        const inventory: Record<string, { totalQty: number; totalCost: number }> = {};

        sortedTrades.forEach((trade: any) => {
          const code = trade.stockCode;
          const type = trade.type;
          // 숫자 변환
          const quantity = Number(trade.quantity);
          const totalPrice = Number(trade.totalPrice);
          const returnRate = Number(trade.returnRate);

          if (!inventory[code]) {
            inventory[code] = { totalQty: 0, totalCost: 0 };
          }

          if (type === "매수") {
            inventory[code].totalQty += quantity;
            inventory[code].totalCost += totalPrice;
            cumulativeInvested += totalPrice;
          }
          else if (type.includes("매도") || type === "비중축소") {
            // 매도 로직
            const currentQty = inventory[code].totalQty;
            const currentCost = inventory[code].totalCost;

            if (currentQty > 0) {
              const avgPrice = currentCost / currentQty;
              const costOfSold = avgPrice * quantity; // 판매분의 원가
              const profit = totalPrice - costOfSold; // 실현 손익

              cumulativeProfit += profit;

              // 재고 차감
              inventory[code].totalQty -= quantity;
              inventory[code].totalCost -= costOfSold;

              // AI 성공률 집계 (수익률 > 0 이면 성공)
              totalSellCount++;
              if (returnRate > 0) {
                successCount++;
              }
            }
          }
        });

        // 4. 최종 수치 계산
        // 전체 수익률 = (누적 실현 손익 / 누적 총 매수 금액) * 100
        const calcTotalReturn = cumulativeInvested > 0
            ? ((cumulativeProfit / cumulativeInvested) * 100).toFixed(2)
            : "0.00";

        // AI 성공률 = (성공 횟수 / 전체 매도 횟수) * 100
        const calcSuccessRate = totalSellCount > 0
            ? ((successCount / totalSellCount) * 100).toFixed(2)
            : "0.00";

        setStats({
          totalReturn: calcTotalReturn,
          successRate: calcSuccessRate
        });

      } catch (error) {
        console.error("통계 계산 중 오류 발생:", error);
      }
    }

    calculateStatsFromJson();
  }, []);

  // stats가 있으면(JSON 로드 성공) 그것을 쓰고, 없으면 props(history) 사용
  const displayTotalReturn = stats
      ? stats.totalReturn
      : (history?.totalReturnRate?.toFixed(2) ?? "0.00");

  const displaySuccessRate = stats
      ? stats.successRate
      : (history?.successRate?.toFixed(2) ?? "0.00");

  const isPositive = Number(displayTotalReturn) >= 0;

  if (!history && !stats) {
    return (
        <p className="text-sm text-gray-400">
          거래 기록 데이터를 불러오는 중입니다...
        </p>
    );
  }

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
              {displayTotalReturn}%
          </span>
          </div>

          {/* AI 성공률 */}
          <div className="flex items-center justify-between rounded-xl bg-[#1f1f2e] px-5 py-4">
          <span className="text-sm text-gray-400">
            AI 사용 시 성공률 (Win Rate)
          </span>
            <span className="text-xl font-bold tabular-nums text-purple-400">
            {displaySuccessRate}%
          </span>
          </div>
        </div>
      </div>
  );
}
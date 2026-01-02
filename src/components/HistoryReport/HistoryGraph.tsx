import { useEffect, useState } from "react";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchHistoricalData } from "../../api/stocksApi";

interface HistoryGraphProps {
  trades: any[];
  selectedPortfolioId: number | null;
}

export default function HistoryGraph({ trades, selectedPortfolioId }: HistoryGraphProps) {
  const [profitView, setProfitView] = useState<"monthly" | "weekly">("monthly");
  const [dailyReturns, setDailyReturns] = useState<any[]>([]);

  // 1. 거래 내역과 종가를 결합하여 일별 수익률 계산
  useEffect(() => {
    async function calculateDailyReturns() {
      if (!selectedPortfolioId || trades.length === 0) return;

      // 해당 포트폴리오의 거래만 필터링 및 날짜 정렬
      const myTrades = trades
        .filter((t) => t.portfolioId === selectedPortfolioId)
        .sort((a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime());

      if (myTrades.length === 0) return;

      // 유니크한 종목 코드 추출
      const stockCodes = Array.from(new Set(myTrades.map((t) => t.stockCode)));

      // 모든 종목의 일일 종가 데이터 가져오기
      const priceHistoryMap: Record<string, any[]> = {};
      await Promise.all(
        stockCodes.map(async (code) => {
          const history = await fetchHistoricalData(code, "day");
          priceHistoryMap[code] = history;
        })
      );

      // 계산 범위 설정 (첫 거래일 ~ 오늘)
      const startDate = new Date(myTrades[0].executedAt);
      const endDate = new Date();
      const result = [];

      // 날짜별 루프
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];

        let totalValue = 0;
        let totalInvested = 0;
        let hasValidPrice = true; // 종가 데이터 존재 여부 플래그

        stockCodes.forEach((code) => {
          const tradesUntilNow = myTrades.filter(
            (t) => new Date(t.executedAt) <= d && t.stockCode === code
          );

          let currentQty = 0;
          let investedAmount = 0;

          tradesUntilNow.forEach((t) => {
            if (t.type === "BUY") {
              currentQty += t.quantity;
              investedAmount += t.totalPrice;
            } else if (t.type === "SELL") {
              currentQty -= t.quantity;
              const avgPrice = investedAmount / (currentQty + t.quantity);
              investedAmount -= avgPrice * t.quantity;
            }
          });

          if (currentQty > 0) {
            const dayPriceInfo = priceHistoryMap[code]?.find((p) => p.time.startsWith(dateStr));
            
            if (dayPriceInfo) {
              totalValue += dayPriceInfo.close * currentQty;
            } else {
              // 해당 날짜에 종가 데이터가 없으면(주말/공휴일 등) 계산 제외 플래그
              hasValidPrice = false;
            }
          }
          
          totalInvested += investedAmount;
        });

        // 변경된 조건: 투자 원금이 있고, 보유 종목의 종가 데이터가 모두 있는 경우만 push
        if (totalInvested > 0 && hasValidPrice && totalValue > 0) {
          const returnValue = ((totalValue - totalInvested) / totalInvested) * 100;
          result.push({
            date: d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
            myReturn: Number(returnValue.toFixed(2)),
          });
        }
      }
      setDailyReturns(result);
    }

    calculateDailyReturns();
  }, [trades, selectedPortfolioId]);

  const monthlyProfit = [
    { month: "1월", profit: 150000, rate: 2.3 },
    { month: "2월", profit: 280000, rate: 4.1 },
    { month: "3월", profit: -120000, rate: -1.8 },
    { month: "4월", profit: 420000, rate: 6.2 },
    { month: "5월", profit: 310000, rate: 4.5 },
    { month: "6월", profit: 180000, rate: 2.6 },
    { month: "7월", profit: 520000, rate: 7.4 },
    { month: "8월", profit: 290000, rate: 4.0 },
    { month: "9월", profit: 380000, rate: 5.2 },
    { month: "10월", profit: 450000, rate: 6.1 },
    { month: "11월", profit: 360000, rate: 4.8 },
  ];

  const weeklyProfit = [
    { week: "1주차", profit: 85000, trades: 5 },
    { week: "2주차", profit: 120000, trades: 8 },
    { week: "3주차", profit: -30000, trades: 3 },
    { week: "4주차", profit: 95000, trades: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* ================= 수익률 비교 (실제 데이터 기반) ================= */}
      <section className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-100">포트폴리오 수익률 추이</h2>
          </div>
          <span className="text-xs text-gray-500">거래 및 종가 데이터 반영</span>
        </div>

        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyReturns}>
              <CartesianGrid stroke="#232332" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f2e",
                  border: "1px solid #232332",
                  borderRadius: "8px",
                  color: "#e5e7eb",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="myReturn"
                stroke="#7c3aed"
                name="내 수익률"
                strokeWidth={2}
                // 이 부분의 값을 false로 바꿉니다.
                dot={false}
                // 마우스 호버 시에만 점을 보여주고 싶다면 아래 속성을 추가할 수 있습니다 (선택사항)
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {dailyReturns.length === 0 && (
            <div className="flex h-full items-center justify-center text-gray-500 text-sm italic">
              데이터를 계산 중이거나 거래 내역이 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* ================= 월 / 주 수익 ================= */}
      <section className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {profitView === "monthly" ? (
              <Calendar className="h-5 w-5 text-purple-400" />
            ) : (
              <BarChart3 className="h-5 w-5 text-purple-400" />
            )}
            <h2 className="text-lg font-semibold text-gray-100">
              {profitView === "monthly" ? "월별" : "주간"} 수익
            </h2>
          </div>

          <div className="flex rounded-lg bg-[#14141c] p-1">
            <button
              onClick={() => setProfitView("monthly")}
              className={`px-3 py-1 text-sm rounded-md transition
                ${profitView === "monthly"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              월
            </button>
            <button
              onClick={() => setProfitView("weekly")}
              className={`px-3 py-1 text-sm rounded-md transition
                ${profitView === "weekly"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              주
            </button>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                profitView === "monthly"
                  ? monthlyProfit
                  : weeklyProfit
              }
            >
              <CartesianGrid
                stroke="#232332"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey={
                  profitView === "monthly" ? "month" : "week"
                }
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f2e",
                  border: "1px solid #232332",
                  borderRadius: "8px",
                  color: "#e5e7eb",
                }}
              />
              <Legend />
              <Bar
                dataKey="profit"
                fill={
                  profitView === "monthly"
                    ? "#7c3aed"
                    : "#00b050"
                }
                name="수익 (원)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

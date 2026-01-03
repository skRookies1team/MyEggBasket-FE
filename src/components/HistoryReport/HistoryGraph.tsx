import { useEffect, useState } from "react";
import Papa from "papaparse";
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

interface HistoryGraphProps {
  trades: any[];
}

export default function HistoryGraph({ trades }: HistoryGraphProps) {
  const [profitView, setProfitView] = useState<"monthly" | "weekly">("monthly");
  const [combinedData, setCombinedData] = useState<any[]>([]);

  useEffect(() => {
    async function calculateTradeReturns() {
      if (!trades || trades.length === 0) return;

      try {
        // 1. 거래 내역 시간순 정렬
        const sortedTrades = [...trades].sort(
          (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
        );

        // 2. CSV 데이터 로드 (AI 수익률 비교용)
        const csvResponse = await fetch("../../../public/data/trade_record.csv");
        const csvText = await csvResponse.text();
        const parsedCsv = Papa.parse(csvText, { header: false, skipEmptyLines: true }).data;

        const csvDataMap = new Map();
        parsedCsv.forEach((row: any) => {
          if (row[0] && row[5]) {
            const dateOnly = row[0].split(" ")[0];
            const rate = parseFloat(row[5].toString().replace("%", ""));
            const d = new Date(dateOnly);
            const dateKey = d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
            csvDataMap.set(dateKey, rate);
          }
        });

        // 3. 매도 시점 기반 수익률 계산
        const result: any[] = [];
        const inventory: Record<string, { totalQty: number; totalCost: number }> = {};
        
        // 누적 실현 손익 및 누적 투입 금액
        let cumulativeRealizedProfit = 0;
        let cumulativeInvestedAmount = 0;

        sortedTrades.forEach((trade) => {
          const code = trade.stockCode;
          const dateKey = new Date(trade.executedAt).toLocaleDateString("ko-KR", {
            month: "numeric",
            day: "numeric",
          });

          if (!inventory[code]) {
            inventory[code] = { totalQty: 0, totalCost: 0 };
          }

          if (trade.type === "BUY") {
            inventory[code].totalQty += trade.quantity;
            inventory[code].totalCost += trade.totalPrice;
            cumulativeInvestedAmount += trade.totalPrice;
          } 
          else if (trade.type === "SELL") {
            // 매도 시점: 평균 단가 기반으로 수익률 계산
            const avgPrice = inventory[code].totalCost / inventory[code].totalQty;
            const realizedProfit = trade.totalPrice - (avgPrice * trade.quantity);
            
            cumulativeRealizedProfit += realizedProfit;
            
            // 재고 업데이트
            inventory[code].totalQty -= trade.quantity;
            inventory[code].totalCost -= avgPrice * trade.quantity;

            // 매도 발생 시점에만 '내 수익률' 기록
            const myReturn = (cumulativeInvestedAmount > 0)
              ? Number(((cumulativeRealizedProfit / cumulativeInvestedAmount) * 100).toFixed(2))
              : 0;

            result.push({
              date: dateKey,
              myReturn: myReturn,
              compareReturn: csvDataMap.get(dateKey) ?? null,
              type: "SELL" // 매도 시점 마킹
            });
          }
        });

        // 만약 매도 데이터가 하나도 없다면 빈 그래프 방지를 위해 날짜만 표시하거나 처리
        setCombinedData(result);
      } catch (error) {
        console.error("데이터 계산 실패:", error);
      }
    }

    calculateTradeReturns();
  }, [trades]);

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
<section className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-100">실현 수익률(매도 시점) 추이</h2>
          </div>
          <p className="text-[11px] text-gray-500">* 매도(SELL)가 완료된 시점의 누적 수익률입니다.</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
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
                name="내 실현 수익률"
                strokeWidth={2}
                dot={{ r: 4, fill: "#7c3aed" }} // 매도 시점을 점으로 표시
                activeDot={{ r: 6 }}
              />
              <Line
                connectNulls
                type="monotone"
                dataKey="compareReturn"
                stroke="#10b981"
                name="AI 수익률"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
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

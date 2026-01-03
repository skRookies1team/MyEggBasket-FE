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
import { fetchHistoricalData } from "../../api/stocksApi";

interface HistoryGraphProps {
  trades: any[];
}

export default function HistoryGraph({ trades}: HistoryGraphProps) {
  const [profitView, setProfitView] = useState<"monthly" | "weekly">("monthly");
  const [combinedData, setCombinedData] = useState<any[]>([]);

  useEffect(() => {
    async function calculateAndCompare() {
      console.log(trades)
      if (trades.length === 0) return;

      try {
        // 1. 내 거래 내역 필터링 및 정렬
        const myTrades = trades
          .sort((a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime());

        if (myTrades.length === 0) return;

        // 종목별 종가 데이터 가져오기
        const stockCodes = Array.from(new Set(myTrades.map((t) => t.stockCode)));
        const priceHistoryMap: Record<string, any[]> = {};
        await Promise.all(
          stockCodes.map(async (code) => {
            const history = await fetchHistoricalData(code, "day");
            priceHistoryMap[code] = history;
          })
        );

        // 2. CSV 파일 읽기 (public/trade_record.csv)
        const csvResponse = await fetch("../../../public/trade_record.csv");
        const csvText = await csvResponse.text();
        const parsedCsv = Papa.parse(csvText, { header: false, skipEmptyLines: true }).data;

        // CSV 날짜별 수익률 Map 생성 (0번: 날짜시간, 5번: 수익률%)
        const csvDataMap = new Map();
        parsedCsv.forEach((row: any) => {
          if (row[0] && row[5]) {
            const dateOnly = row[0].split(" ")[0]; // "2025-12-19"
            const rate = parseFloat(row[5].toString().replace("%", "")); 
            
            const d = new Date(dateOnly);
            const dateKey = d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
            
            // 같은 날 여러 데이터가 있을 경우 마지막 데이터 반영
            csvDataMap.set(dateKey, rate);
          }
        });

        // 3. 일별 통합 데이터 생성 (첫 거래일부터 오늘까지)
        const startDate = new Date(myTrades[0].executedAt);
        const endDate = new Date();
        const result = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];
          const displayDate = d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });

          let totalValue = 0;
          let totalInvested = 0;
          let hasValidPrice = true;

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
                hasValidPrice = false;
              }
            }
            totalInvested += investedAmount;
          });

          // 내 수익률 또는 CSV 데이터 중 하나라도 있는 날만 기록
          const myReturn = (totalInvested > 0 && hasValidPrice && totalValue > 0)
            ? Number(((totalValue - totalInvested) / totalInvested * 100).toFixed(2))
            : null;
          
          const compareReturn = csvDataMap.get(displayDate) ?? null;

          if (myReturn !== null || compareReturn !== null) {
            result.push({
              date: displayDate,
              myReturn: myReturn,
              compareReturn: compareReturn,
            });
          }
        }
        setCombinedData(result);
      } catch (error) {
        console.error("데이터 계산 및 CSV 로드 실패:", error);
      }
    }

    calculateAndCompare();
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
            <h2 className="text-lg font-semibold text-gray-100">최근 3개월 간 수익률 비교 추이</h2>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#7c3aed]"></span>
              <span className="text-gray-400">내 수익률</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
              <span className="text-gray-400">AI 수익률</span>
            </div>
          </div>
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
                connectNulls
                type="monotone"
                dataKey="myReturn"
                stroke="#7c3aed"
                name="내 수익률"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
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
                activeDot={{ r: 5 }}
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

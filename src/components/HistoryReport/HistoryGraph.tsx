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
  ReferenceLine, // [추가] 0 기준선 표시용
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

  // [추가] Y축을 0 기준으로 대칭되게 만들기 위한 범위 계산 함수
  const getSymmetricDomain = (data: any[], keys: string[]) => {
    if (!data || data.length === 0) return ["auto", "auto"];

    let maxAbs = 0;
    data.forEach((item) => {
      keys.forEach((key) => {
        const val = Math.abs(Number(item[key]) || 0);
        if (val > maxAbs) maxAbs = val;
      });
    });

    // 그래프 여백을 위해 10% 정도 더 크게 잡음 (0이면 기본 10 설정)
    if (maxAbs === 0) maxAbs = 10;
    else maxAbs = Math.ceil(maxAbs * 1.1);

    return [-maxAbs, maxAbs];
  };

  useEffect(() => {
    async function calculateTradeReturns() {
      if (!trades || trades.length === 0) {
        console.log("No trades data available.");
        // 데이터가 없어도 빈 그래프를 그리기 위해 combinedData 초기화는 하지 않음 (빈 배열 유지)
        return;
      }

      try {
        // 1. 거래 내역 시간순 정렬 및 정규화
        const sortedTrades = [...trades]
            .map((t) => ({
              executedAt: t.executedAt || t.executed_at,
              stockCode: t.stockCode || t.stock_code,
              type: t.type,
              quantity: Number(t.quantity || 0),
              totalPrice: Number(t.totalPrice || t.total_price || 0),
            }))
            .sort(
                (a, b) =>
                    new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
            );

        // 2. CSV 데이터 로드
        let csvDataMap = new Map();
        try {
          const csvResponse = await fetch("/data/trade_record.csv"); // 경로 확인
          if (csvResponse.ok) {
            const csvText = await csvResponse.text();
            const parsedCsv = Papa.parse(csvText, {
              header: false,
              skipEmptyLines: true,
            }).data;

            parsedCsv.forEach((row: any) => {
              if (row[0] && row[5]) {
                const dateOnly = row[0].split(" ")[0];
                const rate = parseFloat(row[5].toString().replace("%", ""));
                const d = new Date(dateOnly);
                const dateKey = d.toLocaleDateString("ko-KR", {
                  month: "numeric",
                  day: "numeric",
                });
                csvDataMap.set(dateKey, rate);
              }
            });
          }
        } catch (e) {
          console.warn("CSV fetch failed:", e);
        }

        // 3. 수익률 계산
        const result: any[] = [];
        const inventory: Record<
            string,
            { totalQty: number; totalCost: number }
        > = {};

        let cumulativeRealizedProfit = 0;
        let cumulativeInvestedAmount = 0;

        sortedTrades.forEach((trade) => {
          const code = trade.stockCode;
          const dateObj = new Date(trade.executedAt);
          if (isNaN(dateObj.getTime())) return;

          const dateKey = dateObj.toLocaleDateString("ko-KR", {
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
          } else if (trade.type === "SELL") {
            const currentQty = inventory[code].totalQty;
            const currentCost = inventory[code].totalCost;

            if (currentQty > 0) {
              const avgPrice = currentCost / currentQty;
              const costOfSold = avgPrice * trade.quantity;
              const realizedProfit = trade.totalPrice - costOfSold;

              cumulativeRealizedProfit += realizedProfit;

              inventory[code].totalQty -= trade.quantity;
              inventory[code].totalCost -= costOfSold;

              const myReturn =
                  cumulativeInvestedAmount > 0
                      ? Number(
                          (
                              (cumulativeRealizedProfit / cumulativeInvestedAmount) *
                              100
                          ).toFixed(2)
                      )
                      : 0;

              result.push({
                date: dateKey,
                myReturn: myReturn,
                compareReturn: csvDataMap.get(dateKey) ?? null,
                type: "SELL",
              });
            }
          }
        });

        setCombinedData(result);
      } catch (error) {
        console.error("데이터 계산 실패:", error);
      }
    }

    calculateTradeReturns();
  }, [trades]);

  // 임시 데이터 (나중에 실제 데이터로 교체 필요)
  const monthlyProfit = [
    { month: "1월", profit: 150000 },
    { month: "2월", profit: 280000 },
    { month: "3월", profit: -120000 },
    { month: "4월", profit: 420000 },
    { month: "5월", profit: 310000 },
    { month: "6월", profit: 180000 },
    { month: "7월", profit: 520000 },
    { month: "8월", profit: 290000 },
    { month: "9월", profit: 380000 },
    { month: "10월", profit: 450000 },
    { month: "11월", profit: 360000 },
  ];

  const weeklyProfit = [
    { week: "1주차", profit: 85000 },
    { week: "2주차", profit: 120000 },
    { week: "3주차", profit: -30000 },
    { week: "4주차", profit: 95000 },
  ];

  // 그래프 렌더링용 변수
  const barChartData = profitView === "monthly" ? monthlyProfit : weeklyProfit;

  // [계산] 도메인 설정 (0을 가운데로)
  const lineChartDomain = getSymmetricDomain(combinedData, ["myReturn", "compareReturn"]);
  const barChartDomain = getSymmetricDomain(barChartData, ["profit"]);

  return (
      <div className="space-y-6">
        {/* === 수익률 Line Chart === */}
        <section className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-gray-100">
                실현 수익률(매도 시점) 추이
              </h2>
            </div>
            <p className="text-[11px] text-gray-500">
              * 매도(SELL) 완료 시점의 누적 수익률
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid stroke="#232332" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                {/* Y축 도메인을 대칭으로 설정 */}
                <YAxis
                    domain={lineChartDomain}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    unit="%"
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
                {/* 0점 기준선 추가 (X축 처럼 보이게) */}
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />

                <Line
                    type="monotone"
                    dataKey="myReturn"
                    stroke="#7c3aed"
                    name="내 실현 수익률"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#7c3aed" }}
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

        {/* === 수익금 Bar Chart === */}
        <section className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profitView === "monthly" ? (
                  <Calendar className="h-5 w-5 text-purple-400" />
              ) : (
                  <BarChart3 className="h-5 w-5 text-purple-400" />
              )}
              <h2 className="text-lg font-semibold text-gray-100">
                {profitView === "monthly" ? "월별" : "주간"} 수익금
              </h2>
            </div>

            <div className="flex rounded-lg bg-[#14141c] p-1">
              <button
                  onClick={() => setProfitView("monthly")}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                      profitView === "monthly"
                          ? "bg-purple-500/20 text-purple-300"
                          : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                월
              </button>
              <button
                  onClick={() => setProfitView("weekly")}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                      profitView === "weekly"
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
              <BarChart data={barChartData}>
                <CartesianGrid stroke="#232332" strokeDasharray="3 3" />
                <XAxis
                    dataKey={profitView === "monthly" ? "month" : "week"}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                {/* Y축 도메인을 대칭으로 설정 */}
                <YAxis
                    domain={barChartDomain}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f1f2e",
                      border: "1px solid #232332",
                      borderRadius: "8px",
                      color: "#e5e7eb",
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString()}원`,
                      "수익",
                    ]}
                />
                <Legend />
                {/* 0점 기준선 추가 (실선) */}
                <ReferenceLine y={0} stroke="#6b7280" />

                <Bar
                    dataKey="profit"
                    // 양수는 보라색, 음수는 빨간색(또는 회색) 등 색상 분기 가능
                    // 여기서는 단일 색상 사용하되 필요시 Cell 사용
                    fill="#7c3aed"
                    name="수익 (원)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
  );
}
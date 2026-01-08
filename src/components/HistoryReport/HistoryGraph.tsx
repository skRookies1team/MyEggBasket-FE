import { useEffect, useState } from "react";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
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

  // Y축 0 기준 대칭 도메인 계산
  const getSymmetricDomain = (data: any[], keys: string[]) => {
    if (!data || data.length === 0) return ["auto", "auto"];

    let maxAbs = 0;
    data.forEach((item) => {
      keys.forEach((key) => {
        const val = Math.abs(Number(item[key]) || 0);
        if (val > maxAbs) maxAbs = val;
      });
    });

    if (maxAbs === 0) maxAbs = 10;
    else maxAbs = Math.ceil(maxAbs * 1.1);

    return [-maxAbs, maxAbs];
  };

  useEffect(() => {
    async function calculateTradeReturns() {
      try {
        // 1. JSON 데이터 로드 (이제 이것을 메인 소스로 사용)
        let jsonTrades: any[] = [];

        try {
          // 캐시 방지용 타임스탬프 추가
          const response = await fetch(`/data/trade_record.json?t=${new Date().getTime()}`);
          if (response.ok) {
            const rawData = await response.json();

            // JSON 데이터를 내부 포맷으로 변환
            jsonTrades = rawData.map((row: any) => {
              let type = "HOLD";
              // 한글 타입을 영문 타입으로 매핑
              if (row.type === "매수") type = "BUY";
              else if (row.type.includes("매도") || row.type === "비중축소") type = "SELL";

              return {
                executedAt: row.date, // "2026-01-02 09:30:00"
                stockCode: row.stockCode,
                type: type,
                quantity: Number(row.quantity),
                totalPrice: Number(row.totalPrice),
                returnRate: row.returnRate // AI 수익률 등 비교용 데이터가 있다면 사용
              };
            });
          }
        } catch (e) {
          console.warn("JSON fetch/parse failed:", e);
        }

        // 2. 데이터 소스 결정 (JSON 데이터가 있으면 우선 사용, 없으면 props 사용)
        // 사용자가 JSON을 직접 수정하고 있으므로 jsonTrades를 우선시함
        const sourceData = jsonTrades.length > 0 ? jsonTrades : trades;

        if (!sourceData || sourceData.length === 0) return;

        // 3. 시간순 정렬
        const sortedTrades = [...sourceData].sort(
            (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
        );

        // 4. 수익률 계산
        const result: any[] = [];
        const inventory: Record<string, { totalQty: number; totalCost: number }> = {};

        let cumulativeRealizedProfit = 0;
        let cumulativeInvestedAmount = 0;

        sortedTrades.forEach((trade) => {
          const code = trade.stockCode;
          const dateObj = new Date(trade.executedAt);
          if (isNaN(dateObj.getTime())) return;

          const dateKey = dateObj.toLocaleDateString("ko-KR", {
            year: "2-digit", // 연도 구분을 위해 추가
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
              const costOfSold = avgPrice * trade.quantity; // 팔린 수량만큼의 원가
              const realizedProfit = trade.totalPrice - costOfSold; // 매도금액 - 원가 = 실현손익

              cumulativeRealizedProfit += realizedProfit;

              // 재고 차감
              inventory[code].totalQty -= trade.quantity;
              inventory[code].totalCost -= costOfSold;

              // 누적 수익률 계산 (누적 실현 손익 / 누적 총 매수 금액)
              // *단순 예시 로직이며, 실제 수익률 산정 방식에 따라 다를 수 있음
              const myReturn = cumulativeInvestedAmount > 0
                  ? Number(((cumulativeRealizedProfit / cumulativeInvestedAmount) * 100).toFixed(2))
                  : 0;

              // JSON에 있는 returnRate를 'AI 수익률'이나 '개별 건 수익률'로 비교하고 싶다면 사용
              // 여기서는 JSON의 returnRate를 AI/비교 수익률로 매핑한다고 가정
              const compareReturn = trade.returnRate !== undefined ? Number(trade.returnRate) : null;

              result.push({
                date: dateKey,
                myReturn: myReturn,     // 내 누적 포트폴리오 수익률
                compareReturn: compareReturn, // 개별 건의 수익률 (또는 AI 비교값)
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

  // 임시 데이터 (월별/주간 수익금 - 필요시 JSON에서 집계하도록 수정 가능)
  const monthlyProfit = [
    { month: "12월", profit: 450000 },
    { month: "1월", profit: 120000 }, // 1월 데이터 예시
  ];

  const weeklyProfit = [
    { week: "1주차", profit: 85000 },
    { week: "2주차", profit: 120000 },
  ];

  const barChartData = profitView === "monthly" ? monthlyProfit : weeklyProfit;
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
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />

                <Line
                    type="monotone"
                    dataKey="myReturn"
                    stroke="#7c3aed"
                    name="내 누적 수익률"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#7c3aed" }}
                    activeDot={{ r: 6 }}
                />
                <Line
                    connectNulls
                    type="monotone"
                    dataKey="compareReturn"
                    stroke="#10b981"
                    name="개별 건 수익률" // JSON의 returnRate를 표시
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
                <ReferenceLine y={0} stroke="#6b7280" />

                <Bar
                    dataKey="profit"
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
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { BarChart3, TrendingUp } from "lucide-react";
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
  const [combinedData, setCombinedData] = useState<any[]>([]);

  /* ================================
   * Y축 0 기준 대칭 도메인 계산
   * ================================ */
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

  /* ================================
   * 실현 수익률(LineChart) 계산
   * ================================ */
  useEffect(() => {
    async function calculateTradeReturns() {
      if (!trades || trades.length === 0) return;

      try {
        /* 1. 거래 정렬 */
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
              new Date(a.executedAt).getTime() -
              new Date(b.executedAt).getTime()
          );

        /* 2. 비교용 CSV 수익률 로드 */
        const csvDataMap = new Map<string, number>();
        try {
          const csvResponse = await fetch("/data/trade_record.csv");
          if (csvResponse.ok) {
            const csvText = await csvResponse.text();
            const parsed = Papa.parse(csvText, {
              header: false,
              skipEmptyLines: true,
            }).data as any[];

            parsed.forEach((row) => {
              if (row[0] && row[5]) {
                const dateOnly = row[0].split(" ")[0];
                const rate = parseFloat(
                  row[5].toString().replace("%", "")
                );
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

        /* 3. 실현 수익률 계산 */
        const result: any[] = [];
        const inventory: Record<
          string,
          { totalQty: number; totalCost: number }
        > = {};

        let cumulativeRealizedProfit = 0;
        let cumulativeInvestedAmount = 0;

        sortedTrades.forEach((trade) => {
          const dateObj = new Date(trade.executedAt);
          if (isNaN(dateObj.getTime())) return;

          const dateKey = dateObj.toLocaleDateString("ko-KR", {
            month: "numeric",
            day: "numeric",
          });

          if (!inventory[trade.stockCode]) {
            inventory[trade.stockCode] = { totalQty: 0, totalCost: 0 };
          }

          if (trade.type === "BUY") {
            inventory[trade.stockCode].totalQty += trade.quantity;
            inventory[trade.stockCode].totalCost += trade.totalPrice;
            cumulativeInvestedAmount += trade.totalPrice;
          }

          if (trade.type === "SELL") {
            const currentQty = inventory[trade.stockCode].totalQty;
            const currentCost = inventory[trade.stockCode].totalCost;

            if (currentQty > 0) {
              const avgPrice = currentCost / currentQty;
              const costOfSold = avgPrice * trade.quantity;
              const realizedProfit = trade.totalPrice - costOfSold;

              cumulativeRealizedProfit += realizedProfit;

              inventory[trade.stockCode].totalQty -= trade.quantity;
              inventory[trade.stockCode].totalCost -= costOfSold;

              const myReturn =
                cumulativeInvestedAmount > 0
                  ? Number(
                      (
                        (cumulativeRealizedProfit /
                          cumulativeInvestedAmount) *
                        100
                      ).toFixed(2)
                    )
                  : 0;

              result.push({
                date: dateKey,
                myReturn,
                compareReturn: csvDataMap.get(dateKey) ?? null,
              });
            }
          }
        });

        setCombinedData(result);
      } catch (e) {
        console.error("데이터 계산 실패:", e);
      }
    }

    calculateTradeReturns();
  }, [trades]);

  /* ================================
   * 주별 더미 수익금 데이터 (BarChart)
   * ================================ */
  const weeklyProfit = [
    { week: "1주차", profit: 85000 },
    { week: "2주차", profit: 120000 },
    { week: "3주차", profit: -30000 },
    { week: "4주차", profit: 95000 },
  ];

  const lineChartDomain = getSymmetricDomain(combinedData, [
    "myReturn",
    "compareReturn",
  ]);
  const barChartDomain = getSymmetricDomain(weeklyProfit, ["profit"]);

  return (
    <div className="space-y-6">
      {/* ================= 실현 수익률 Line Chart ================= */}
      <section className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-100">
              실현 수익률(매도 시점) 추이
            </h2>
          </div>
          <p className="text-[11px] text-gray-500">
            * 매도(SELL) 완료 시점 기준
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
                name="내 실현 수익률"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="compareReturn"
                stroke="#10b981"
                name="AI 수익률"
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ================= 주별 수익금 Bar Chart ================= */}
      <section className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-100">
            주간 수익금
          </h2>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyProfit}>
              <CartesianGrid stroke="#232332" strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
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
                name="주간 수익 (원)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import type { StockPriceData } from "../../types/stock";
import { fetchStockCurrentPrice } from "../../api/liveStockApi";
import { fetchHistoricalData } from "../../api/stocksApi";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  stockCode: string;
  name: string;
  quantity: number;
  avgPrice: number;
}

export default function StockTrendCard({
  stockCode,
  name,
  quantity,
  avgPrice,
}: Props) {
  const [chartData, setChartData] = useState<StockPriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [changeRate, setChangeRate] = useState(0);

  /* =========================
     데이터 로딩
  ========================= */
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [history, current] = await Promise.all([
          fetchHistoricalData(stockCode, "day"),
          fetchStockCurrentPrice(stockCode),
        ]);

        if (!mounted) return;

        if (history && history.length > 0) {
          const normalized = [...history]
            .sort(
              (a, b) =>
                new Date(a.time).getTime() -
                new Date(b.time).getTime()
            )
            .map((d) => ({
              ...d,
              time: String(d.time),
              price: Number(d.price),
            }))
            .slice(-30);

          setChartData(normalized);
        } else {
          setChartData([]);
        }

        if (current) {
          setCurrentPrice(current.currentPrice);
          setChangeRate(current.changeRate);
        }
      } catch (e) {
        console.error("StockTrendCard load error:", e);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [stockCode]);

  /* =========================
     수익 계산
  ========================= */
  const profit = (currentPrice - avgPrice) * quantity;
  const profitRate =
    avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

  const isUp = changeRate >= 0;
  const isProfit = profit >= 0;

  const lineColor = isUp ? "#ff383c" : "#00e676";

  /* =========================
     렌더링
  ========================= */
  return (
    <div
      className="
        flex h-full flex-col justify-between
        rounded-2xl bg-gradient-to-b
        from-[#1a1a24] to-[#14141c]
        p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]
      "
    >
      {/* ---------- 상단 ---------- */}
      <div className="mb-3">
        <h3 className="mb-1 text-sm font-semibold text-gray-100">
          {name}
        </h3>

        <div className="flex items-baseline gap-2">
          <p className="text-lg font-bold text-white">
            {currentPrice
              ? `₩${currentPrice.toLocaleString()}`
              : "-"}
          </p>

          {currentPrice > 0 && (
            <p
              className={`text-sm font-semibold ${
                isUp ? "text-red-400" : "text-blue-400"
              }`}
            >
              {isUp ? "+" : ""}
              {changeRate}%
            </p>
          )}
        </div>
      </div>

      {/* ---------- 차트 ---------- */}
      <div className="mb-3 h-[120px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2e2e44"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                interval="preserveStartEnd"
                tickFormatter={(val) => {
                  const d = new Date(val);
                  if (Number.isNaN(d.getTime())) return String(val);
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  return `${mm}-${dd}`;
                }}
              />

              <YAxis hide domain={["auto", "auto"]} />

              <Tooltip
                formatter={(value: number) => [
                  `₩${value.toLocaleString()}`,
                  "주가",
                ]}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                }}
                contentStyle={{
                  backgroundColor: "#14141c",
                  borderRadius: "8px",
                  border: "1px solid #2e2e44",
                  color: "#e5e7eb",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#e5e7eb" }}
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            데이터 로딩중...
          </div>
        )}
      </div>

      {/* ---------- 하단 ---------- */}
      <div className="flex justify-between border-t border-[#2e2e44] pt-3 text-xs">
        <span className="text-gray-400">
          {quantity.toLocaleString()}주 · 평단 ₩
          {avgPrice.toLocaleString()}
        </span>

        <span
          className={`font-semibold ${
            isProfit ? "text-red-400" : "text-blue-400"
          }`}
        >
          {isProfit ? "+" : ""}
          ₩{profit.toLocaleString()} (
          {isProfit ? "+" : ""}
          {profitRate.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}

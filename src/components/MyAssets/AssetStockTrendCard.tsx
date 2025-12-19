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
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [changeRate, setChangeRate] = useState<number>(0);

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

        /* ---------- 차트 데이터 ---------- */
        if (history && history.length > 0) {
          const normalized = [...history]
            // 과거 → 최신 정렬
            .sort(
              (a, b) =>
                new Date(a.time).getTime() - new Date(b.time).getTime()
            )
            // 타입 보정 (Recharts 안정성 핵심)
            .map((d) => ({
              ...d,
              time: String(d.time),
              price: Number(d.price),
            }))
            //  최근 30일
            .slice(-30);

          setChartData(normalized);
        } else {
          setChartData([]);
        }

        /* ---------- 현재가 ---------- */
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

  const lineColor = isUp ? "#ff383c" : "#0066ff";
  const profitColor = isProfit ? "#ff383c" : "#0066ff";

  /* =========================
     렌더링
  ========================= */
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #d9d9d9",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* ---------- 상단 ---------- */}
      <div style={{ marginBottom: "12px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1e1e1e",
            marginBottom: "4px",
          }}
        >
          {name}
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1e1e1e",
            }}
          >
            {currentPrice ? `₩${currentPrice.toLocaleString()}` : "-"}
          </p>

          {currentPrice > 0 && (
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: lineColor,
              }}
            >
              {isUp ? "+" : ""}
              {changeRate}%
            </p>
          )}
        </div>
      </div>

      {/* ---------- 차트 ---------- */}
      <div style={{ height: "120px", width: "100%", marginBottom: "12px" }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#999" }}
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
                  borderRadius: "8px",
                  border: "1px solid #eee",
                  fontSize: "12px",
                }}
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
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "#999",
            }}
          >
            데이터 로딩중...
          </div>
        )}
      </div>

      {/* ---------- 하단 ---------- */}
      <div
        style={{
          paddingTop: "12px",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
        }}
      >
        <span style={{ color: "#666" }}>
          {quantity.toLocaleString()}주 (평단 ₩{avgPrice.toLocaleString()})
        </span>

        <span style={{ fontWeight: 600, color: profitColor }}>
          {isProfit ? "+" : ""}
          ₩{profit.toLocaleString()} ({isProfit ? "+" : ""}
          {profitRate.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}

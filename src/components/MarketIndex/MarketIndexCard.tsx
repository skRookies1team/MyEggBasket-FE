import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  XAxis,
} from "recharts";
import "../../assets/MarketIndex/MarketIndexCard.css";

interface MarketIndexCardProps {
  name: string;
  value: string;
  change: string;
  percent: string;
  isUp: boolean;
  miniChartData: number[];
}

export function MarketIndexCard({
  name,
  value,
  change,
  percent,
  isUp,
  miniChartData,
}: MarketIndexCardProps) {
  // 1) Normalize 데이터 (변화폭 강조)
  const base = miniChartData[0];
  const normalizedData = miniChartData.map((v, i) => ({
    x: i,
    y: v - base,
  }));

  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "0.3s",
        background: "#fff",
      }}
    >
      {/* 지수명 */}
      <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
        {name}
      </div>

      {/* 지수 값 */}
      <div style={{ fontSize: "24px", fontWeight: 600, marginBottom: "6px" }}>
        {value}
      </div>

      {/* 등락 정보 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", color: isUp ? "#ff383c" : "#0066ff" }}>
          {change} ({percent})
        </span>
        {isUp ? (
          <TrendingUp size={14} color="#ff383c" style={{ marginLeft: "4px" }} />
        ) : (
          <TrendingDown size={14} color="#0066ff" style={{ marginLeft: "4px" }} />
        )}
      </div>

      {/* ===== Sparkline (Recharts) ===== */}
      <div style={{ width: "100%", height: "90px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={normalizedData}>
            {/* X축 숨김 */}
            <XAxis dataKey="x" hide />

            {/* Y축 숨김 */}
            <YAxis hide domain={["auto", "auto"]} />

            {/* 곡선 라인 */}
            <Line
              type="monotone"
              dataKey="y"
              stroke={isUp ? "#ff383c" : "#0066ff"}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

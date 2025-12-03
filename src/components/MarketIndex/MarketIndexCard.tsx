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

  const base = miniChartData[0] ?? 0;

  let normalizedData = miniChartData.map((v, i) => ({
    x: i,
    y: v - base,
  }));

  // 최소 두 포인트 생성 (Sparkline 깨짐 방지)
  if (normalizedData.length <= 1) {
    normalizedData = [
      { x: 0, y: 0 },
      { x: 1, y: 0.0001 },
    ];
  }

  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "0.3s",
        background: "#fff",
        width: "180px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
        {name}
      </div>

      <div style={{ fontSize: "24px", fontWeight: 600, marginBottom: "6px" }}>
        {value}
      </div>

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

      {/* Sparkline */}
      <div style={{ width: "100%", height: "90px", minHeight: "90px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={normalizedData}>
            <XAxis dataKey="x" hide />
            <YAxis hide domain={["auto", "auto"]} />
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

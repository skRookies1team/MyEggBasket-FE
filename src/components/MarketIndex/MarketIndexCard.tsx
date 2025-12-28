import { Card, CardContent, Typography, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface MarketIndexCardProps {
  name: string;
  value: string;
  change: string;
  percent: string;
  isUp: boolean;
  miniChartData?: number[];
}

export function MarketIndexCard({
  name,
  value,
  change,
  percent,
  isUp,
  miniChartData,
}: MarketIndexCardProps) {
  /* ------------------------------
   * miniChartData 기반 SVG 계산
   * ------------------------------ */
  let points = "";
  let areaPoints = "";

  if (miniChartData && miniChartData.length > 1) {
    const max = Math.max(...miniChartData);
    const min = Math.min(...miniChartData);
    const range = max - min || 1;

    points = miniChartData
      .map((val, i) => {
        const x = (i / (miniChartData.length - 1)) * 100;
        const y = 40 - ((val - min) / range) * 35;
        return `${x},${y}`;
      })
      .join(" ");

    areaPoints = `0,40 ${points} 100,40`;
  }

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #1a1a24 0%, #232332 100%)",
        border: "1px solid #2a2a35",
        minWidth: 200,
        flex: 1,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "#7c3aed",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* 지수명 */}
        <Typography
          variant="caption"
          sx={{
            color: "#a8a8b8",
            fontWeight: 600,
            display: "block",
            mb: 0.5,
          }}
        >
          {name}
        </Typography>

        {/* 현재값 */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#ffffff", mb: 0.5 }}
        >
          {value}
        </Typography>

        {/* 변동 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
          {isUp ? (
            <TrendingUpIcon sx={{ fontSize: 16, color: "#ff4d6a" }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 16, color: "#3ca8ff" }} />
          )}
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: isUp ? "#ff4d6a" : "#3ca8ff",
            }}
          >
            {change} ({percent})
          </Typography>
        </Box>

        {/* miniChartData 있을 때만 차트 렌더 */}
        {miniChartData && miniChartData.length > 1 && (
          <Box sx={{ mt: 1, width: "100%", height: 40 }}>
            <svg
              width="100%"
              height="40"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id={`grad-${name}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={isUp ? "#ff4d6a" : "#3ca8ff"}
                    stopOpacity="0.4"
                  />
                  <stop
                    offset="100%"
                    stopColor={isUp ? "#ff4d6a" : "#3ca8ff"}
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* 영역 */}
              <polygon
                points={areaPoints}
                fill={`url(#grad-${name})`}
              />

              {/* 라인 */}
              <polyline
                points={points}
                fill="none"
                stroke={isUp ? "#ff4d6a" : "#3ca8ff"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

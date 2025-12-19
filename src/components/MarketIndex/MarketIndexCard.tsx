import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface MarketIndexCardProps {
  name: string;
  value: string;
  change: string;
  percent: string;
  isUp: boolean;
  miniChartData?: number[]; // 이 데이터가 중요합니다!
}

export function MarketIndexCard({
  name,
  value,
  change,
  percent,
  isUp,
  miniChartData = [],
}: MarketIndexCardProps) {
  // 데이터가 없을 경우를 대비한 가짜 데이터 (테스트용으로 살려두려면 사용)
  const displayData = miniChartData.length > 0 ? miniChartData : [10, 15, 8, 12, 20, 18, 25];
  
  const max = Math.max(...displayData);
  const min = Math.min(...displayData);
  const range = max - min || 1;

  // SVG 좌표 계산
  const points = displayData
    .map((val, i) => {
      const x = (i / (displayData.length - 1)) * 100;
      const y = 40 - ((val - min) / range) * 35; // 높이 40px 기준
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,40 ${points} 100,40`;

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #1a1a24 0%, #232332 100%)",
        border: "1px solid #2a2a35",
        minWidth: "200px",
        flex: 1,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "#7c3aed",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="caption" sx={{ color: "#a8a8b8", fontWeight: 600, display: "block", mb: 0.5 }}>
          {name}
        </Typography>
        <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, color: "#ffffff" }}>
          {value}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
          {isUp ? <TrendingUpIcon sx={{ fontSize: 16, color: "#00e676" }} /> : <TrendingDownIcon sx={{ fontSize: 16, color: "#ff4d6a" }} />}
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: isUp ? "#00e676" : "#ff4d6a" }}>
            {change} ({percent})
          </Typography>
        </Box>

        {/* 그래프 영역: 확실히 보이도록 svg 높이와 여백 조절 */}
        <Box sx={{ mt: 1, width: '100%', height: 40 }}>
          <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id={`grad-${name}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isUp ? "#00e676" : "#ff4d6a"} stopOpacity="0.4" />
                <stop offset="100%" stopColor={isUp ? "#00e676" : "#ff4d6a"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#grad-${name})`} />
            <polyline
              points={points}
              fill="none"
              stroke={isUp ? "#00e676" : "#ff4d6a"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
      </CardContent>
    </Card>
  );
}
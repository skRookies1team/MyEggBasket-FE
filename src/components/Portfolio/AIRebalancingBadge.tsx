import { Box, Chip, Tooltip, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";

import type { AIRecommendation } from "../../types/aiRecommendation";

interface Props {
  recommendations: AIRecommendation[];
  onClick?: () => void;
}

export function AIRebalancingBadge({
  recommendations,
  onClick,
}: Props) {
  /* ---------------- 안전 처리 ---------------- */
  if (!recommendations || recommendations.length === 0) {
    return (
      <Chip
        label="AI 분석 없음"
        size="small"
        variant="outlined"
        sx={{ color: "#777" }}
      />
    );
  }

  /* ---------------- 우선순위 계산 (Portfolio 기준) ---------------- */
  const typePriority: Record<AIRecommendation["type"], number> = {
    RISK: 3,
    REBALANCING: 2,
    HOLD: 1,
  };

  const dominantType = recommendations.reduce(
    (prev, curr) =>
      typePriority[curr.type] > typePriority[prev.type] ? curr : prev,
    recommendations[0]
  ).type;

  const avgConfidence =
    recommendations.reduce((sum, r) => sum + r.confidence, 0) /
    recommendations.length;

  /* ---------------- UI 설정 ---------------- */
  const configMap = {
    REBALANCING: {
      label: "AI 리밸런싱 추천",
      color: "#22c55e",
      icon: <TrendingUpIcon fontSize="small" />,
    },
    RISK: {
      label: "AI 리스크 경고",
      color: "#ef4444",
      icon: <TrendingDownIcon fontSize="small" />,
    },
    HOLD: {
      label: "AI 관망",
      color: "#9ca3af",
      icon: <HorizontalRuleIcon fontSize="small" />,
    },
  } as const;

  const config = configMap[dominantType];

  /* ---------------- 렌더 ---------------- */
  return (
    <Tooltip
      arrow
      title={
        <Box>
          <Typography fontSize={12} fontWeight={600}>
            {config.label}
          </Typography>
          <Typography fontSize={12}>
            평균 신뢰도: {(avgConfidence * 100).toFixed(1)}%
          </Typography>
          <Typography fontSize={12}>
            AI 추천 수: {recommendations.length}
          </Typography>
        </Box>
      }
    >
      <Chip
        icon={config.icon}
        label={config.label}
        onClick={onClick}
        clickable={!!onClick}
        sx={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          border: `1px solid ${config.color}`,
          fontWeight: 600,
          cursor: onClick ? "pointer" : "default",

          /* RISK 강조 애니메이션 */
          ...(dominantType === "RISK" && {
            animation: "shake 0.6s ease-in-out",
          }),

          "@keyframes shake": {
            "0%": { transform: "translateX(0)" },
            "25%": { transform: "translateX(-2px)" },
            "50%": { transform: "translateX(2px)" },
            "75%": { transform: "translateX(-2px)" },
            "100%": { transform: "translateX(0)" },
          },
        }}
      />
    </Tooltip>
  );
}

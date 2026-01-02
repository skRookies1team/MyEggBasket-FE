import { Box, Chip, Tooltip, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";

import type { AIRecommendationResponse } from "../../types/aiRecommendation";

interface Props {
  recommendations: AIRecommendationResponse[];
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

  /* ---------------- 우선순위 계산 ---------------- */
  const actionPriority: Record<
    AIRecommendationResponse["actionType"],
    number
  > = {
    SELL: 3,
    BUY: 2,
    HOLD: 1,
  };

  const dominantAction = recommendations.reduce(
    (prev, curr) =>
      actionPriority[curr.actionType] >
      actionPriority[prev.actionType]
        ? curr
        : prev,
    recommendations[0]
  ).actionType;

  const avgAiScore =
    recommendations.reduce((sum, r) => sum + r.aiScore, 0) /
    recommendations.length;

  /* ---------------- UI 설정 ---------------- */
  const configMap = {
    BUY: {
      label: "AI 매수 추천",
      color: "#22c55e",
      icon: <TrendingUpIcon fontSize="small" />,
    },
    SELL: {
      label: "AI 매도 경고",
      color: "#ef4444",
      icon: <TrendingDownIcon fontSize="small" />,
    },
    HOLD: {
      label: "AI 관망",
      color: "#9ca3af",
      icon: <HorizontalRuleIcon fontSize="small" />,
    },
  } as const;

  const config = configMap[dominantAction];

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
            평균 AI 점수: {avgAiScore.toFixed(1)}
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

          /* SELL 경고 애니메이션 */
          ...(dominantAction === "SELL" && {
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

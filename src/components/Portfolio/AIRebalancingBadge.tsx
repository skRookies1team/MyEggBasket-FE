import { Box, Chip, Tooltip, Typography, Divider } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { AiRecommendation } from "../../pages/PortfolioPage";

interface Props {
    recommendation?: AiRecommendation | null;
    currentWeight?: number; // 부모에서 계산된 현재 비중
    onClick?: () => void;
}

export function AIRebalancingBadge({ recommendation, currentWeight, onClick }: Props) {

    /* ---------------- 데이터가 없을 경우 처리 ---------------- */
    if (!recommendation) {
        return (
            <Chip
                label="AI 분석 없음"
                size="small"
                variant="outlined"
                sx={{ color: "#777", borderColor: "#444" }}
            />
        );
    }

    /* ---------------- 데이터 추출 ---------------- */
    const {
        actionType,
        aiScore,
        reasonSummary,
        riskWarning,
        adjustmentAmount,
        targetHoldingDisplay
    } = recommendation;

    const configMap = {
        BUY: {
            label: "AI 매수 추천",
            color: "#22c55e", // Green
            icon: <TrendingUpIcon fontSize="small" />,
        },
        SELL: {
            label: "AI 매도 경고",
            color: "#ef4444", // Red
            icon: <TrendingDownIcon fontSize="small" />,
        },
        HOLD: {
            label: "AI 관망",
            color: "#9ca3af", // Gray
            icon: <HorizontalRuleIcon fontSize="small" />,
        },
    } as const;

    const config = configMap[actionType] || configMap.HOLD;
    const hasRisk = !!riskWarning;

    /* ---------------- 렌더링 ---------------- */
    return (
        <Tooltip
            arrow
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: "#1e1e2d",
                        border: "1px solid #3f3f5f",
                        p: 2,
                        maxWidth: 320,
                    },
                },
            }}
            title={
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {/* 헤더 */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight={700} color={config.color}>
                            {config.label} ({aiScore}점)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(recommendation.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                    {/* 핵심 내용: 사유 */}
                    <Typography variant="body2" color="white" sx={{ wordBreak: "keep-all" }}>
                        {reasonSummary}
                    </Typography>

                    {/* 리스크 경고 */}
                    {hasRisk && (
                        <Box display="flex" gap={1} alignItems="center" mt={0.5} color="#ff9800">
                            <WarningAmberIcon fontSize="small" />
                            <Typography variant="caption" fontWeight={600}>
                                주의: {riskWarning}
                            </Typography>
                        </Box>
                    )}

                    {/* [수정] 비중 및 금액 정보: 목표 비중(API)과 현재 비중(계산) 함께 표시 */}
                    <Box sx={{ bgcolor: "rgba(255,255,255,0.05)", p: 1.5, borderRadius: 1, mt: 1 }}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color="#aaa">현재 비중</Typography>
                            <Typography variant="caption" color="white" fontWeight={600}>
                                {currentWeight ? currentWeight.toFixed(1) : "0.0"}%
                            </Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color={config.color}>목표 비중</Typography>
                            <Typography variant="caption" color={config.color} fontWeight={600}>
                                {targetHoldingDisplay || "0원 (0.0%)"}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.1)" }} />

                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" color="#aaa">조정 금액</Typography>
                            <Typography variant="caption" color={adjustmentAmount > 0 ? "#22c55e" : "#ef4444"} fontWeight={600}>
                                {adjustmentAmount > 0 ? "+" : ""}
                                {adjustmentAmount.toLocaleString()}원
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            }
        >
            <Chip
                icon={config.icon}
                label={`${config.label} ${aiScore}점`}
                onClick={onClick}
                size="small"
                sx={{
                    backgroundColor: `${config.color}15`, // 투명도 15%
                    color: config.color,
                    border: `1px solid ${config.color}`,
                    fontWeight: 700,
                    cursor: onClick ? "pointer" : "default",
                    ...(actionType === "SELL" && {
                        animation: "shake 0.8s ease-in-out infinite",
                        animationIterationCount: 1,
                    }),
                    "@keyframes shake": {
                        "0%, 100%": { transform: "translateX(0)" },
                        "20%, 60%": { transform: "translateX(-2px)" },
                        "40%, 80%": { transform: "translateX(2px)" },
                    },
                }}
            />
        </Tooltip>
    );
}
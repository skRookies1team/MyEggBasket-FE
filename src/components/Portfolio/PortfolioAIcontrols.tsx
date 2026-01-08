import { Box } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useAIRecommendationStore } from "../../store/aiRecommendationStore";

interface Props {
  portfolioId: number;
}

export function PortfolioAIControls({ portfolioId }: Props) {
  const {
    loadRecommendations,
    addRecommendation,
  } = useAIRecommendationStore();

  return (
    <Box display="flex" gap={1.5}>
      {/* POST */}
      <button
        className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
        onClick={() => {
          // ❗ 실제로는 백엔드 AI 분석 실행 API 호출
          addRecommendation({
            portfolioId,
            stockCode: "ALL", // 예시
            aiScore: 75,
            actionType: "HOLD",
            currentHolding: 0,
            targetHolding: 0,
            targetHoldingPercentage: 0,
            adjustmentAmount: 0,
          });
        }}
      >
        <AutoAwesomeIcon fontSize="small" /> AI 분석 실행
      </button>

      {/* GET */}
      <button
        className="rounded-lg border border-purple-400 px-3 py-1.5 text-sm font-semibold text-purple-300 hover:bg-purple-400/10"
        onClick={() => loadRecommendations(portfolioId)}
      >
        <RefreshIcon fontSize="small" /> 결과 불러오기
      </button>
    </Box>
  );
}

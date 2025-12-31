import api from "../store/axiosStore";
import type { 
  AIRecommendation,
  AIRecommendationCreateRequest as CreateAIRecommendationRequest 
} from "../types/aiRecommendation";

/* ===================== */
/* API 함수 */
/* ===================== */

// 추천 생성
export const createAIRecommendation = async (
  payload: CreateAIRecommendationRequest
): Promise<AIRecommendation> => {
  const res = await api.post("/ai-recommendations", payload);
  return res.data;
};

// 추천 조회
export const fetchAIRecommendations = async (
  portfolioId: number
): Promise<AIRecommendation[]> => {
  const res = await api.get(
    `/portfolios/${portfolioId}/ai-recommendations`
  );
  return res.data;
};

import api from "../store/axiosStore";
import type {
  AIRecommendationCreateRequest,
  AIRecommendationResponse,
} from "../types/aiRecommendation";

/* =========================
   AI 추천 생성
========================= */
export async function createAIRecommendation(
  payload: AIRecommendationCreateRequest
): Promise<AIRecommendationResponse> {
  const res = await api.post<AIRecommendationResponse>(
    "/ai-recommendations",
    payload
  );
  return res.data;
}

/* =========================
   포트폴리오 AI 추천 조회
========================= */
export async function fetchAIRecommendations(
  portfolioId: number
): Promise<AIRecommendationResponse[]> {
  const res = await api.get<AIRecommendationResponse[]>(
    `/portfolios/${portfolioId}/ai-recommendations`
  );
  return res.data;
}

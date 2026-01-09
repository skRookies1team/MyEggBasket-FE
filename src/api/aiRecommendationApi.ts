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

/* =========================
   글로벌 리밸런싱 상태 체크
   ========================= */
export async function checkRebalancingStatus(): Promise<{
  hasRebalancing: boolean;
  portfolioIds: number[];
}> {
  const res = await api.get<{
    hasRebalancing: boolean;
    portfolioIds: number[];
  }>("/ai-recommendations/status");
  return res.data;
}

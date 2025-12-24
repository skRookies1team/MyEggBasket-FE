// src/api/aiRecommendationApi.ts
import api from "../store/axiosStore";
import type {
  AIRecommendationCreateRequest,
  AIRecommendationResponse,
} from "../types/aiRecommendation";

export const createAIRecommendation = async (
  payload: AIRecommendationCreateRequest
): Promise<AIRecommendationResponse> => {
  const res = await api.post(
    "/ai-recommendations",
    payload
  );
  return res.data;
};

export const fetchAIRecommendations = async (
  portfolioId: number
): Promise<AIRecommendationResponse[]> => {
  const res = await api.get(
    `/portfolios/${portfolioId}/ai-recommendations`
  );
  return res.data;
};

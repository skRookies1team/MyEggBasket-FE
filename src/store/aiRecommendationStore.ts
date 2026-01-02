import { create } from "zustand";
import {
  fetchAIRecommendations,
  createAIRecommendation,
} from "../api/aiRecommendationApi";
import type {
  AIRecommendationResponse,
  AIRecommendationCreateRequest,
} from "../types/aiRecommendation";

interface AIRecommendationState {
  recommendations: AIRecommendationResponse[];
  isLoading: boolean;

  loadRecommendations: (portfolioId: number) => Promise<void>;
  addRecommendation: (req: AIRecommendationCreateRequest) => Promise<void>;

  /** 최신 추천 1개 */
  latestRecommendation?: AIRecommendationResponse;
}

export const useAIRecommendationStore = create<AIRecommendationState>(
  (set) => ({
    recommendations: [],
    isLoading: false,
    latestRecommendation: undefined,

    loadRecommendations: async (portfolioId) => {
      set({ isLoading: true });
      try {
        const data = await fetchAIRecommendations(portfolioId);
        set({
          recommendations: data,
          latestRecommendation: data[0],
        });
      } finally {
        set({ isLoading: false });
      }
    },

    addRecommendation: async (req) => {
      const created = await createAIRecommendation(req);
      set((state) => ({
        recommendations: [created, ...state.recommendations],
        latestRecommendation: created,
      }));
    },
  })
);

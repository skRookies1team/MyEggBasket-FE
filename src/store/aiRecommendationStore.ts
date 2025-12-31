// src/store/aiRecommendationStore.ts
import { create } from "zustand";

import {
  fetchAIRecommendations,
  createAIRecommendation,
} from "../api/aiRecommendationApi";

import type {
  AIRecommendation,
  AIRecommendationCreateRequest as CreateAIRecommendationRequest,
} from "../types/aiRecommendation";

interface AIRecommendationState {
  recommendations: AIRecommendation[];
  isLoading: boolean;

  loadRecommendations: (portfolioId: number) => Promise<void>;
  addRecommendation: (payload: CreateAIRecommendationRequest) => Promise<void>;
}

export const useAIRecommendationStore = create<AIRecommendationState>(
  (set) => ({
    recommendations: [],
    isLoading: false,

    loadRecommendations: async (portfolioId) => {
      set({ isLoading: true });
      try {
        const data = await fetchAIRecommendations(portfolioId);
        set({ recommendations: data });
      } finally {
        set({ isLoading: false });
      }
    },

    addRecommendation: async (payload) => {
      const created = await createAIRecommendation(payload);
      set((state) => ({
        recommendations: [created, ...state.recommendations],
      }));
    },
  })
);

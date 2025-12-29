import { create } from "zustand";
import type { AIRecommendationResponse } from "../types/aiRecommendation";

interface AIRecommendationState {
  recommendations: AIRecommendationResponse[];
  setRecommendations: (data: AIRecommendationResponse[]) => void;
  clear: () => void;
}

export const useAIRecommendationStore =
  create<AIRecommendationState>((set) => ({
    recommendations: [],

    setRecommendations: (data) =>
      set({ recommendations: data }),

    clear: () =>
      set({ recommendations: [] }),
  }));

// src/types/aiRecommendation.ts

export type RecommendationAction = "BUY" | "SELL" | "HOLD";

export interface AIRecommendationCreateRequest {
  portfolioId: number;
  stockCode: string;
  aiScore: number; // 0 ~ 100
  actionType: RecommendationAction;

  currentHolding: number;
  targetHolding: number;
  targetHoldingPercentage: number;
  adjustmentAmount: number;

  reasonSummary?: string;
  riskWarning?: string;
}

export interface AIRecommendationResponse {
  recommendationId: number;
  portfolioId: number;
  stockCode: string;
  stockName: string;

  aiScore: number;
  actionType: RecommendationAction;

  currentHolding: number;
  targetHoldingDisplay: string;
  adjustmentAmount: number;

  reasonSummary?: string;
  riskWarning?: string;
  createdAt: string;
}

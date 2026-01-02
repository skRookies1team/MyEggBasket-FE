/* =========================
   백엔드 enum 대응
========================= */
export type RecommendationAction = "BUY" | "SELL" | "HOLD";

/* =========================
   POST 요청 DTO
========================= */
export interface AIRecommendationCreateRequest {
  portfolioId: number;
  stockCode: string;

  aiScore: number; // 0 ~ 100
  actionType: RecommendationAction;

  currentHolding: number;        // BigDecimal → number
  targetHolding: number;         // BigDecimal → number
  targetHoldingPercentage: number;

  adjustmentAmount: number;      // BigDecimal → number

  reasonSummary?: string;
  riskWarning?: string;
}

/* =========================
   GET 응답 DTO
========================= */
export interface AIRecommendationResponse {
  recommendationId: number;
  portfolioId: number;

  stockCode: string;
  stockName: string;

  aiScore: number;
  actionType: RecommendationAction;

  currentHolding: number;
  targetHoldingDisplay: string;  // "1,000,000원 (20.0%)"
  adjustmentAmount: number;

  reasonSummary?: string;
  riskWarning?: string;

  createdAt: string; // ISO datetime
}

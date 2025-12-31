// src/types/aiRecommendation.ts

/**
 * 포트폴리오 단위 AI 추천 유형
 * - REBALANCING: 리밸런싱 권고
 * - RISK: 리스크 경고
 * - HOLD: 관망
 */
export type RecommendationType = "REBALANCING" | "RISK" | "HOLD";

/**
 * AI 추천 생성 요청 (AI 서버 → 백엔드)
 */
export interface AIRecommendationCreateRequest {
  portfolioId: number;
  type: RecommendationType;

  summary: string;      // AI 판단 요약
  confidence: number;   // 0 ~ 1 (신뢰도)
}

/**
 * AI 추천 응답 (백엔드 → 프런트)
 */
export interface AIRecommendation {
  recommendationId: number;
  portfolioId: number;
  type: RecommendationType;

  summary: string;
  confidence: number;

  createdAt: string; // ISO-8601
}

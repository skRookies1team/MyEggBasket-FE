import { useEffect, useRef, useState } from "react";
import { Brain, X } from "lucide-react";
import { fetchAIRecommendations } from "../../api/aiRecommendationApi";
import type { AIRecommendationResponse } from "../../types/aiRecommendation";

interface Props {
  portfolioId: number;
}

export function AIRecommendationAlertManager({ portfolioId }: Props) {
  const [alerts, setAlerts] = useState<AIRecommendationResponse[]>([]);
  const seenIds = useRef<Set<number>>(new Set());

  /* =========================
   * API 조회 + 신규 알림 감지
   * ========================= */
  const fetchAndNotify = async () => {
    console.log("[AI-Alert] 추천 조회 시작", portfolioId);

    try {
      const data = await fetchAIRecommendations(portfolioId);
      console.log("[AI-Alert] API 응답", data);

      data.forEach((rec) => {
        if (seenIds.current.has(rec.recommendationId)) return;

        console.log(
          "[AI-Alert] 신규 추천 감지",
          rec.recommendationId,
          rec.stockName
        );

        seenIds.current.add(rec.recommendationId);
        addAlert(rec);
      });
    } catch (err) {
      console.error("[AI-Alert] 추천 조회 실패", err);
    }
  };

  /* =========================
   * 최초 + 5분 주기 Polling
   * ========================= */
  useEffect(() => {
    if (!portfolioId) return;

    console.log("[AI-Alert] 초기 로딩");
    fetchAndNotify();

    const interval = setInterval(fetchAndNotify, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
  }, [portfolioId]);

  /* =========================
   * 알림 추가
   * ========================= */
  const addAlert = (rec: AIRecommendationResponse) => {
    setAlerts((prev) => [rec, ...prev]);

    setTimeout(() => {
      removeAlert(rec.recommendationId);
    }, 8000);
  };

  /* =========================
   * 알림 제거
   * ========================= */
  const removeAlert = (id: number) => {
    setAlerts((prev) =>
      prev.filter((a) => a.recommendationId !== id)
    );
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-96 z-[9999] flex flex-col gap-4">
      {alerts.map((rec) => (
        <div
          key={rec.recommendationId}
          className="w-[440px] rounded-xl border border-purple-500/30 bg-[#1a1a24]/95 p-4 shadow-xl backdrop-blur"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <Brain size={18} />
              <span className="font-bold text-sm">
                AI 포트폴리오 리밸런싱
              </span>
            </div>
            <button onClick={() => removeAlert(rec.recommendationId)}>
              <X size={14} className="text-gray-400 hover:text-gray-200" />
            </button>
          </div>

          {/* 종목 + 액션 */}
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-100">
              {rec.stockName}
            </span>
            <span
              className={
                rec.actionType === "BUY"
                  ? "text-red-400"
                  : rec.actionType === "SELL"
                  ? "text-blue-400"
                  : "text-gray-400"
              }
            >
              {rec.actionType === "BUY" && "비중 확대"}
              {rec.actionType === "SELL" && "비중 축소"}
              {rec.actionType === "HOLD" && "유지"}
            </span>
          </div>

          {/* 요약 사유 */}
          {rec.reasonSummary && (
            <p className="mt-2 text-xs text-gray-300">
              {rec.reasonSummary}
            </p>
          )}

          {/* 목표 비중 */}
          <div className="mt-2 text-xs text-gray-400">
            목표 비중: {rec.targetHoldingDisplay}
          </div>

          {/* 조정 금액 */}
          <div className="mt-1 text-xs text-gray-400">
            조정 금액:{" "}
            <span
              className={
                rec.adjustmentAmount > 0
                  ? "text-red-400"
                  : rec.adjustmentAmount < 0
                  ? "text-blue-400"
                  : "text-gray-400"
              }
            >
              {rec.adjustmentAmount.toLocaleString()}원
            </span>
          </div>

          {/* 리스크 경고 */}
          {rec.riskWarning && (
            <div className="mt-2 text-[11px] text-yellow-400">
              ⚠ {rec.riskWarning}
            </div>
          )}

          {/* AI 점수 */}
          <div className="mt-2 text-[10px] text-gray-500">
            AI 점수 {rec.aiScore.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
}

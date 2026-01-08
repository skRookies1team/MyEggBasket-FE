import { useEffect, useRef, useState } from "react";
import { Brain, X, TestTube } from "lucide-react"; // TestTube 아이콘 유지 (테스트용)
import { fetchAIRecommendations } from "../../api/aiRecommendationApi";
import type { AIRecommendationResponse } from "../../types/aiRecommendation";

interface Props {
  portfolioId: number;
}

interface AIAlert extends AIRecommendationResponse {
  uniqueAlertId: string;
  triggeredAt: Date;
}

export function AIRebalanceAlertManager({ portfolioId }: Props) {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  // 중복 알림 방지를 위한 ID 기록
  const seenIds = useRef<Set<number>>(new Set());

  // [디버그] 모니터링 시작 로그
  useEffect(() => {
    console.log(`[AI-Alert] 모니터링 시작 (PortfolioID: ${portfolioId})`);
  }, [portfolioId]);

  /* =========================
   * 알림 제거 핸들러
   * ========================= */
  const removeAlert = (uniqueAlertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.uniqueAlertId !== uniqueAlertId));
  };

  /* =========================
   * API 조회 및 알림 생성 로직
   * ========================= */
  const fetchAndNotify = async () => {
    if (!portfolioId) return;

    try {
      const data = await fetchAIRecommendations(portfolioId);

      // 1. 최신순 정렬
      const sortedData = data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // 2. 종목별 최신 데이터 1개만 필터링
      const latestMap: Record<string, AIRecommendationResponse> = {};
      sortedData.forEach((item) => {
        if (!latestMap[item.stockCode]) {
          latestMap[item.stockCode] = item;
        }
      });
      const latestList = Object.values(latestMap);

      // 3. 새로운 알림 선별
      const newAlerts: AIAlert[] = [];
      latestList.forEach((rec) => {
        // 이전에 본 적 없는 ID라면 알림 큐에 추가
        if (!seenIds.current.has(rec.recommendationId)) {
          seenIds.current.add(rec.recommendationId);
          newAlerts.push({
            ...rec,
            uniqueAlertId: `ai-${rec.recommendationId}-${Date.now()}`,
            triggeredAt: new Date(),
          });
        }
      });

      // 4. 상태 업데이트 및 자동 사라짐 타이머 설정
      if (newAlerts.length > 0) {
        console.log(`[AI-Alert] 🔔 신규 알림 ${newAlerts.length}건 발생`);

        setAlerts((prev) => [...newAlerts, ...prev]);

        // [중요] 각 새 알림마다 5초 뒤 사라지게 설정
        newAlerts.forEach((alert) => {
          setTimeout(() => {
            removeAlert(alert.uniqueAlertId);
          }, 5000); // 5초 후 제거
        });
      }

    } catch (err) {
      console.error("[AI-Alert] 조회 중 오류 발생:", err);
    }
  };

  /* =========================
   * 주기적 실행 (5분)
   * ========================= */
  useEffect(() => {
    // 1. 컴포넌트 로드 시 즉시 1회 실행
    fetchAndNotify();

    // 2. 5분(300,000ms)마다 주기적 실행
    const intervalId = setInterval(fetchAndNotify, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [portfolioId]);

  return (
      <>
        {/* 알림 배너 영역 */}
        <div className="fixed top-20 right-4 z-[9990] flex flex-col gap-2 w-80 pointer-events-none">
          {alerts.map((alert) => (
              <div
                  key={alert.uniqueAlertId}
                  className="pointer-events-auto animate-slide-in relative flex items-start gap-3 rounded-xl bg-[#14141c]/95 p-4 shadow-lg backdrop-blur-md transition-all hover:bg-[#1f1f2e] border border-[#2a2a35]"
              >
                {/* 아이콘 */}
                <div
                    className={`mt-1 rounded-full p-2 ${
                        alert.actionType === "BUY"
                            ? "bg-red-500/10 text-red-400"
                            : alert.actionType === "SELL"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-gray-500/10 text-gray-400"
                    }`}
                >
                  <Brain size={20} />
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-gray-100 truncate">
                      {alert.stockName}
                    </h4>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                  {alert.triggeredAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-gray-200">
                    {alert.actionType === "BUY" && "🚀 비중 확대 추천"}
                    {alert.actionType === "SELL" && "📉 비중 축소 추천"}
                    {alert.actionType === "HOLD" && "🔒 관망(HOLD) 추천"}
                  </p>

                  <div className="mt-1.5 flex flex-col gap-0.5 text-xs text-gray-400">
                    <p>
                      목표 비중:{" "}
                      <span className="text-gray-300">
                    {alert.targetHoldingDisplay}
                  </span>
                    </p>
                    <p>
                      점수: <span className="text-purple-400">{alert.aiScore}점</span>
                    </p>
                  </div>
                </div>

                {/* 닫기 버튼 */}
                <button
                    onClick={() => removeAlert(alert.uniqueAlertId)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
          ))}
        </div>

        {/* [테스트용] AI 알림 강제 실행 버튼 (필요 시 주석 해제하여 사용) */}
      {/*  <button*/}
      {/*  onClick={fetchAndNotify}*/}
      {/*  className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95"*/}
      {/*  >*/}
      {/*  <TestTube size={20} />*/}
      {/*  AI 알림 강제 실행*/}
      {/*</button>*/}
      </>
  );
}
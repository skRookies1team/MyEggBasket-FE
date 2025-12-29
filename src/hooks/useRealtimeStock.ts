import { useEffect, useRef, useState } from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import { useWebSocket } from "../context/WebSocketContext"; // 경로 확인 필요

export interface RealtimePricePayload {
  stockCode: string;
  tickTime: string;
  price: number;
  diff: number;
  diffRate: number;
  volume: number;
  tradingValue?: number;
}

// 헬퍼 함수: 구독 요청 (그대로 유지)
export const requestStockSubscription = (
    stompClient: Client,
    stockCode: string,
    callback: (data: RealtimePricePayload) => void
) => {
  if (!stompClient || !stompClient.connected) return null;

  return stompClient.subscribe(
      `/topic/realtime-price/${stockCode}`,
      (message) => {
        try {
          const payload = JSON.parse(message.body) as RealtimePricePayload;
          callback(payload);
        } catch (e) {
          console.error("[STOMP] payload parse error", e);
        }
      },
      { id: `sub-${stockCode}` }
  );
};

// 훅 수정: 전역 클라이언트 사용
export function useRealtimePrice(stockCode: string, enabled: boolean) {
  const { client, isConnected } = useWebSocket(); // 전역 소켓 가져오기
  const [data, setData] = useState<RealtimePricePayload | null>(null);
  const subRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    if (!enabled || !stockCode || !client || !isConnected) return;

    // 이미 구독 중이면 해제 후 재구독 (혹은 중복 방지 로직)
    if (subRef.current) subRef.current.unsubscribe();

    // 구독 수행
    subRef.current = requestStockSubscription(client, stockCode, (payload) => {
      setData(payload);
    });

    // 언마운트 시: "연결 해제(deactivate)"가 아니라 "구독 취소(unsubscribe)"만 수행
    return () => {
      if (subRef.current) {
        subRef.current.unsubscribe();
        subRef.current = null;
      }
    };
  }, [stockCode, enabled, client, isConnected]);

  return data;
}
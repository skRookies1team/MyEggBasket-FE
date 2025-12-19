import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { StompSubscription } from "@stomp/stompjs";
import { BACKEND_WS_URL } from "../config/api";

export interface RealtimePricePayload {
  stockCode: string;
  tickTime: string; // HHmmss
  price: number;
  diff: number;
  diffRate: number;
  volume: number;
}

/**
 * 🔹 [분리된 구독 함수] 
 * 클라이언트와 종목 코드, 콜백을 받아 구독을 실행합니다.
 */
export const requestStockSubscription = (
  stompClient: Client, 
  stockCode: string, 
  callback: (data: RealtimePricePayload) => void
) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("[STOMP] 클라이언트가 연결되지 않았습니다.");
    return null;
  }

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
    { 
      virtual: "false", // 백엔드에서 실서버/가상서버 판단 기준
      id: `sub-${stockCode}`
    }
  );
};

/**
 * 🔹 [데이터 수신 훅] 
 * 단일 종목의 실시간 데이터를 관리할 때 사용합니다.
 */
export function useRealtimePrice(stockCode: string, enabled: boolean) {
  const [data, setData] = useState<RealtimePricePayload | null>(null);
  const subRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    if (!enabled || !stockCode) return;

    const client = new Client({
      brokerURL: `ws://${new URL(BACKEND_WS_URL).host}/ws`,
      reconnectDelay: 3000,
    });

    client.onConnect = () => {
      console.log("[STOMP] Connected for single stock:", stockCode);
      
      // ✅ 외부 함수를 사용하여 구독 로직 일원화
      subRef.current = requestStockSubscription(client, stockCode, (payload) => {
        setData(payload);
      });
    };

    client.activate();

    return () => {
      subRef.current?.unsubscribe();
      client.deactivate();
    };
  }, [stockCode, enabled]);

  return data;
}
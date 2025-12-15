import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { StompSubscription } from "@stomp/stompjs";

export interface RealtimePricePayload {
  stockCode: string;
  tickTime: string; // HHmmss
  price: number;
  diff: number;
  diffRate: number;
  volume: number;
}

/**
 * @param stockCode 종목 코드
 * @param enabled   true일 때만 WebSocket 연결 (ex: period === 'minute')
 */
export function useRealtimePrice(
  stockCode: string,
  enabled: boolean
) {
  const [data, setData] = useState<RealtimePricePayload | null>(null);

  const clientRef = useRef<Client | null>(null);
  const subRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    // ✅ 분봉이 아닐 때: Client 생성 자체를 하지 않음
    if (!enabled || !stockCode) {
      return;
    }

    const client = new Client({
      brokerURL: "ws://localhost:8081/ws",

      // reconnect는 "실시간이 필요한 상황"에서만 의미 있음
      reconnectDelay: 3000,

      debug: (msg) => console.log("[STOMP]", msg),
    });

    client.onConnect = () => {
      console.log("[STOMP] connected");

      // 안전장치: 중복 구독 방지
      subRef.current?.unsubscribe();

      subRef.current = client.subscribe(
        `/topic/realtime-price/${stockCode}`,
        (message) => {
          try {
            const payload = JSON.parse(
              message.body
            ) as RealtimePricePayload;

            setData(payload);
          } catch (e) {
            console.error("[STOMP] payload parse error", e);
          }
        }
      );
    };

    client.onWebSocketClose = () => {
      console.log("[STOMP] WebSocket closed");
    };

    client.activate();
    clientRef.current = client;

    // ✅ cleanup: enabled 변경 / 종목 변경 / unmount 시
    return () => {
      subRef.current?.unsubscribe();
      subRef.current = null;

      client.deactivate();
      clientRef.current = null;
    };
  }, [stockCode, enabled]);

  return data;
}

// src/hooks/useRealtimeIndex.ts
import { useState, useEffect, useRef } from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BACKEND_WS_URL } from "../config/api";

export interface IndexRealtimeData {
  indexName: "KOSPI" | "KOSDAQ";
  time: string;
  current: number;
  change: number;
  rate: number;
  volume: number;
}

export interface UseRealtimeResult<T> {
  data: T | null;
  connected: boolean;
  loading: boolean;
}

export function useRealtimeIndex(
    indexCode: "001" | "201" // 001: 코스피, 201: 코스닥
): UseRealtimeResult<IndexRealtimeData> {
  const [data, setData] = useState<IndexRealtimeData | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const clientRef = useRef<Client | null>(null);
  const subRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    // 1. 클라이언트 설정 (SockJS 사용)
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_WS_URL}/ws`),
      reconnectDelay: 5000,
      debug: (str) => console.log(`[Index-STOMP] ${str}`),
    });

    client.onConnect = () => {
      setConnected(true);
      setLoading(false);

      // 2. 지수 구독 (백엔드가 이 경로로 쏴줘야 함)
      // 예: /topic/realtime-index/001
      subRef.current = client.subscribe(
          `/topic/realtime-index/${indexCode}`,
          (message) => {
            if (message.body) {
              try {
                // 백엔드가 JSON으로 변환해서 준다고 가정
                const parsed = JSON.parse(message.body) as IndexRealtimeData;
                setData(parsed);
              } catch (err) {
                console.error("[Index-STOMP] Parse Error:", err);
              }
            }
          }
      );
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (subRef.current) subRef.current.unsubscribe();
      if (clientRef.current) clientRef.current.deactivate();
    };
  }, [indexCode]);

  return { data, connected, loading };
}
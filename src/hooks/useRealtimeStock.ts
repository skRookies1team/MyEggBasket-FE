import { useEffect, useRef, useState } from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import { useWebSocket } from "../context/WebSocketContext";

export interface RealtimePricePayload {
  stockCode: string;
  tickTime: string;
  price: number;
  diff: number;
  diffRate: number;
  volume: number;
  tradingValue?: number;
}

/**
 * [Helper] 백엔드 메시지 파싱 및 매핑
 * 백엔드 DTO(StockTickDTO) -> 프론트엔드 포맷(RealtimePricePayload)
 */
const parseAndMap = (messageBody: string): RealtimePricePayload => {
  const body = JSON.parse(messageBody);

  // 1. 기본 값 추출
  const price = Number(body.currentPrice ?? body.price ?? 0);
  const diffRate = Number(body.changeRate ?? body.diffRate ?? body.fluctuationRate ?? 0);
  let diff = Number(body.changeAmount ?? body.diff ?? body.compareToPreviousClosePrice ?? 0);

  // 2. [추가된 로직] 백엔드에서 diff를 안 보내줄 경우, 가격과 등락률로 역산
  // 공식: 변동폭 = (현재가 * 등락률) / (100 + 등락률)
  if (diff === 0 && diffRate !== 0 && price !== 0) {
    const prevClose = price / (1 + diffRate / 100);
    diff = Math.round(price - prevClose);
  }

  return {
    stockCode: body.stockCode,
    tickTime: body.timestamp || body.tickTime,
    price: price,
    diffRate: diffRate,
    volume: Number(body.accumulatedTradingVolume ?? body.volume ?? 0),
    diff: diff, // 계산된 변동폭 적용
    tradingValue: Number(body.accumulatedTradingValue ?? body.tradingValue ?? 0),
  };
};

/**
 * [Export Helper] 직접 구독 요청 함수
 * MainPage.tsx 등에서 여러 종목을 한꺼번에 구독할 때 사용
 */
export const requestStockSubscription = (
    client: Client,
    stockCode: string,
    callback: (data: RealtimePricePayload) => void
): StompSubscription | null => {
  if (!client || !client.connected || !stockCode) return null;

  return client.subscribe(
      `/topic/realtime-price/${stockCode}`,
      (message) => {
        try {
          const payload = parseAndMap(message.body);
          callback(payload);
        } catch (e) {
          console.error("[STOMP] Data parse error:", e);
        }
      },
      { id: `sub-${stockCode}` }
  );
};

/**
 * [Export Hook] 단일 종목 실시간 구독 훅
 * StockDetailPage.tsx 등에서 사용
 */
export function useRealtimePrice(stockCode: string, enabled: boolean) {
  const { client, isConnected } = useWebSocket();
  const [data, setData] = useState<RealtimePricePayload | null>(null);
  const subRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    // 1. 연결이 없거나 비활성화 상태면 중단
    if (!enabled || !stockCode || !client || !isConnected) return;

    // 2. 기존 구독 해제 (중복 방지)
    if (subRef.current) {
      subRef.current.unsubscribe();
    }

    // 3. 헬퍼 함수를 사용하여 구독 시작
    subRef.current = requestStockSubscription(client, stockCode, (payload) => {
      setData(payload);
    });

    // 4. 언마운트 시 구독 해제
    return () => {
      if (subRef.current) {
        subRef.current.unsubscribe();
        subRef.current = null;
      }
    };
  }, [stockCode, enabled, client, isConnected]);

  return data;
}
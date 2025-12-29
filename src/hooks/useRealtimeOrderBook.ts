import { useState, useEffect } from "react";
import type { OrderBookData } from "../types/stock";

export function useRealtimeOrderBook(stockCode: string) {
  const [orderBook, setOrderBook] = useState<OrderBookData | undefined>();

  useEffect(() => {
    // 이미 열려있는 웹소켓 연결을 사용한다고 가정 (예: 싱글톤 또는 Context)
    // 여기서는 로직의 흐름만 설명합니다.
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "ORDER_BOOK" && data.code === stockCode) {
        setOrderBook({
          sell: data.asks, // 백엔드의 asks -> sell 매핑
          buy: data.bids,  // 백엔드의 bids -> buy 매핑
          totalAskQty: data.totalAskQty,
          totalBidQty: data.totalBidQty
        });
      }
    };

    // WebSocket 객체에 이벤트 리스너 등록 로직 필요
    // window.addEventListener('message', handleMessage); ... 
    
    return () => { /* 리스너 제거 */ };
  }, [stockCode]);

  return orderBook;
}
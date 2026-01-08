import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext"; // 글로벌 WS 사용
import type { OrderBookData, OrderItem } from "../types/stock";

export function useRealtimeOrderBook(stockCode: string) {
  const [orderBook, setOrderBook] = useState<OrderBookData | undefined>();
  const { client, isConnected } = useWebSocket();

  useEffect(() => {
    if (!client || !isConnected || !stockCode) return;

    console.log(`[OrderBook] Subscribing to /topic/stock-order-book/${stockCode}`);

    // 백엔드 중계 경로 구독
    const subscription = client.subscribe(
        `/topic/stock-order-book/${stockCode}`,
        (message) => {
          try {
            const data = JSON.parse(message.body);

            if (data.type === "ORDER_BOOK") {
              // 데이터 매핑 (Python 필드명 -> Frontend 타입)
              // Python: asks=[{price:.., qty:..}], bids=[...]
              // Frontend: OrderItem { price: number, volume: number }

              const mapToOrderItem = (items: any[]): OrderItem[] =>
                  items.map((item: any) => ({
                    price: Number(item.price),
                    volume: Number(item.qty || item.volume)
                  }));

              setOrderBook({
                sell: mapToOrderItem(data.asks || []),
                buy: mapToOrderItem(data.bids || []),
                totalAskQty: Number(data.totalAskQty),
                totalBidQty: Number(data.totalBidQty),
              });
            }
          } catch (e) {
            console.error("[OrderBook] Parse Error:", e);
          }
        }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isConnected, stockCode]);

  return orderBook;
}
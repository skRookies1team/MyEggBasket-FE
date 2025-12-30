// src/hooks/useRealtimeOrderBook.ts
import { useState, useEffect, useRef } from "react";
import type { OrderBookData, OrderItem } from "../types/stock";

export function useRealtimeOrderBook(stockCode: string) {
  const [orderBook, setOrderBook] = useState<OrderBookData | undefined>();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws?userId=1");
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "ORDER_BOOK" && data.code === stockCode) {
          
          const mapToOrderItem = (items: any[]): OrderItem[] => 
            items.map(item => ({
              price: Number(item.price),
              volume: Number(item.qty) 
            }));

          setOrderBook({
            sell: mapToOrderItem(data.asks),     
            buy: mapToOrderItem(data.bids),      
            totalAskQty: data.totalAskQty,       
            totalBidQty: data.totalBidQty        
          });
        }
      } catch (e) {
        console.error("[WS] Parsing Error:", e);
      }
    };

    socket.onopen = () => console.log(`[WS] Connected: ${stockCode}`);
    socket.onerror = (err) => console.error("[WS] Error:", err);
    socket.onclose = () => console.log("[WS] Disconnected");

    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [stockCode]);

  return orderBook;
}
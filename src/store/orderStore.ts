import { create } from "zustand";
import api from "../store/axiosStore";
import { useAuthStore } from "./authStore";

// 1. API 응답 데이터에 맞는 타입 정의
export interface TradeHistoryItem {
  transactionId: number;
  stockCode: string;
  stockName: string;
  type: "BUY" | "SELL";
  typeDescription: string;
  status: "COMPLETED";
  statusDescription: string;
  quantity: number;
  price: number;
  totalPrice: number;
  executedAt: string;
}

interface OrderState {
  tradeHistory: TradeHistoryItem[];
  fetchTradeHistory: (userId: number) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  tradeHistory: [],

  // 2. 새로운 API 엔드포인트로 체결 내역을 가져오는 함수
  fetchTradeHistory: async (userId: number) => {
    try {
      const response = await api.get<TradeHistoryItem[]>(`/users/${userId}/orders?status=completed`);
      set({ tradeHistory: response.data });
    } catch (error) {
      console.error("체결 내역을 불러오는 중 오류가 발생했습니다.", error);
      set({ tradeHistory: [] }); // 오류 발생 시 빈 배열로 초기화
    }
  },
}));
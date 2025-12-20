import { create } from "zustand";
import { fetchTradeHistory } from "../api/tradeApi";

// ===== API 응답 타입 (TransactionDTO.Response 매핑) =====
export interface TradeHistoryItem {
  transactionId: number;

  stockCode: string;
  stockName: string;

  type: "BUY" | "SELL";
  typeDescription: string;

  status: string; // COMPLETED, PENDING, CANCELLED 등
  statusDescription: string;

  quantity: number;
  price: number;
  totalPrice: number;

  triggerSource?: "MANUAL" | "AI";
  triggerSourceName?: string;

  executedAt: string;
}

interface OrderState {
  tradeHistory: TradeHistoryItem[];
  loading: boolean;
  fetchTradeHistory: (status?: string, virtual?: boolean) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  tradeHistory: [],
  loading: false,

  fetchTradeHistory: async (status, virtual = false) => {
    try {
      set({ loading: true });
      const data = await fetchTradeHistory(status, virtual);
      set({ tradeHistory: data });
    } catch (error) {
      console.error("거래 내역 조회 실패", error);
      set({ tradeHistory: [] });
    } finally {
      set({ loading: false });
    }
  },
}));

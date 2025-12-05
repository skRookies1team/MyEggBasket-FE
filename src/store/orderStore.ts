import { create } from "zustand";
import api from "../store/axiosStore";
import { useAuthStore } from "./authStore";

interface ApiOrder {
  transactionId: number;
  stockCode: string | null;
  stockName: string | null;
  type: "BUY" | "SELL";
  typeDescription: string;
  status: "COMPLETED" | "PENDING" | "CANCELED";
  statusDescription: string;
  quantity: number;
  price: number;
  totalPrice: number;
  triggerSource: string | null;
  triggerSourceName: string | null;
  executedAt: string;
}

interface Order {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: "buy" | "sell";
  status: "completed" | "pending" | "canceled";
  createdAt: string;
}

interface OrderState {
  tradeHistory: Order[];
  pendingOrders: Order[];
  fetchTradeHistory: () => Promise<void>;
  fetchPendingOrders: () => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  tradeHistory: [],
  pendingOrders: [],

  fetchTradeHistory: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const res = await api.get<ApiOrder[]>(`users/${user.id}/orders`, {
        params: { status: "completed" },
      });
      const tradeHistory = res.data.map(
        (order: ApiOrder): Order => ({
          id: order.transactionId.toString(),
          symbol: order.stockName || "Unknown",
          price: order.price,
          quantity: order.quantity,
          side: order.type.toLowerCase() as "buy" | "sell",
          status: order.status.toLowerCase() as "completed",
          createdAt: order.executedAt,
        })
      );

      set({ tradeHistory });
    } catch (error) {
      console.error("Failed to fetch trade history:", error);
    }
  },

  fetchPendingOrders: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const res = await api.get<ApiOrder[]>(`users/${user.id}/orders`, {
        params: { status: "pending" },
      });
      const pendingOrders = res.data.map(
        (order: ApiOrder): Order => ({
          id: order.transactionId.toString(),
          symbol: order.stockName || "Unknown",
          price: order.price,
          quantity: order.quantity,
          side: order.type.toLowerCase() as "buy" | "sell",
          status: order.status.toLowerCase() as "pending",
          createdAt: order.executedAt,
        })
      );
      set({ pendingOrders });
    } catch (error) {
      console.error("Failed to fetch pending orders:", error);
    }
  },
}));
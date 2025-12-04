import { create } from "zustand";
import api from "../store/axiosStore";
import { useAuthStore } from "./authStore";

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
      const res = await api.get(`users/${user.id}/orders`, {
        params: { status: "completed" },
      });
      set({ tradeHistory: res.data });
    } catch (error) {
      console.error("Failed to fetch trade history:", error);
    }
  },

  fetchPendingOrders: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const res = await api.get(`users/${user.id}/orders`, {
        params: { status: "pending" },
      });
      set({ pendingOrders: res.data });
    } catch (error) {
      console.error("Failed to fetch pending orders:", error);
    }
  },
}));
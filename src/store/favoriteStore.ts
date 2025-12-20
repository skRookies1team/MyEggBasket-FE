import { create } from "zustand";
import api from "../store/axiosStore";

interface WatchItem {
  interestId: number;
  stockCode: string;
  name: string;
  marketType: string;
  sector: string | null;
}

interface FavoriteState {
  favorites: WatchItem[];
  isLoading: boolean;

  loadFavorites: () => Promise<void>;
  toggleFavorite: (stockCode: string | number) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,

  /** 관심종목 조회 */
  loadFavorites: async () => {
    set({ isLoading: true });

    try {
      const res = await api.get("/users/watchlist");

      const mapped: WatchItem[] = res.data.map((item: any) => ({
        interestId: item.interestId,
        stockCode: item.stock.stockCode,
        name: item.stock.name,
        marketType: item.stock.marketType,
        sector: item.stock.sector,
      }));

      set({ favorites: mapped });
    } catch (err) {
      console.error("관심종목 목록 조회 실패:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  /** 관심종목 추가/삭제 */
  toggleFavorite: async (stockCode: string | number) => {
    const code = String(stockCode);
    const { favorites, loadFavorites } = get();

    const exists = favorites.some((item) => item.stockCode === code);

    try {
      if (exists) {
        // ❗ 백엔드는 stockCode로 삭제함 → interestId 사용하면 409 발생
        await api.delete(`/users/watchlist/${code}`);
      } else {
        await api.post("/users/watchlist", { stockCode: code });
      }

      // 최신 상태 다시 불러오기
      await loadFavorites();
    } catch (err) {
      console.error("관심종목 저장 실패:", err);
    }
  },
}));

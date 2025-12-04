import { create } from "zustand";
import api from "../store/axiosStore";

interface FavoriteState {
  favorites: string[];
  isLoading: boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (code: string | number) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,

  /* ===========================================
     📌 1) 관심종목 목록 조회 (DB → Zustand)
  ============================================ */
  loadFavorites: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/users/watchlist");

      // stockCode만 추출
      const codes = res.data.map((item: any) => String(item.stock.stockCode));

      set({ favorites: codes });
    } catch (err) {
      console.error("관심종목 목록 조회 실패:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  /* ===========================================
     📌 2) 관심종목 토글 처리 (Optimistic + DB Sync)
  ============================================ */
  toggleFavorite: async (code: string | number) => {
    const stringCode = String(code);
    const { favorites, loadFavorites } = get();

    const exists = favorites.includes(stringCode);

    // ⭐ Optimistic UI 업데이트
    const updated = exists
      ? favorites.filter((c) => c !== stringCode)
      : [...favorites, stringCode];

    set({ favorites: updated });

    try {
      if (exists) {
        // 🔥 삭제
        await api.delete(`/users/watchlist/${stringCode}`);
      } else {
        // 🔥 추가
        await api.post("/users/watchlist", { stockCode: stringCode });
      }

      // ⭐ DB 기준 최신화 (가장 중요!)
      await loadFavorites();
    } catch (err) {
      console.error("관심종목 저장 실패:", err);

      // ❗ 실패 시 UI 롤백
      set({ favorites });
    }
  },
}));

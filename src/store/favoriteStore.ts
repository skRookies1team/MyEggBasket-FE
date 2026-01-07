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
    // 이미 로딩 중이면 중복 호출 방지 (선택 사항)
    // set({ isLoading: true });

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

  /** 관심종목 추가/삭제 (낙관적 업데이트) */
  toggleFavorite: async (stockCode: string | number) => {
    const code = String(stockCode);
    const { favorites, loadFavorites } = get();

    const exists = favorites.some((item) => item.stockCode === code);

    // [1] 화면 먼저 즉시 업데이트 (UI 반응성 향상)
    if (exists) {
      // 삭제: 리스트에서 즉시 제거
      set({
        favorites: favorites.filter((item) => item.stockCode !== code),
      });
    } else {
      // 추가: 임시 항목 추가 (Egg2 -> Egg3 즉시 변경)
      const tempItem: WatchItem = {
        interestId: 0,
        stockCode: code,
        name: "", // 이름은 나중에 로드되거나 UI에서 기존 정보 사용
        marketType: "",
        sector: null,
      };
      set({ favorites: [...favorites, tempItem] });
    }

    // [2] 서버 요청 (백그라운드)
    try {
      if (exists) {
        await api.delete(`/users/watchlist/${code}`);
      } else {
        await api.post("/users/watchlist", { stockCode: code });
      }

      // [3] 데이터 동기화 (ID 및 상세 정보 확보를 위해 조용히 재로딩)
      await loadFavorites();
    } catch (err) {
      console.error("관심종목 저장 실패:", err);
      // 실패 시 롤백을 위해 목록 다시 불러오기
      await loadFavorites();
    }
  },
}));
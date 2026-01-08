import { create } from "zustand";

interface PortfolioState {
  /** 현재 선택된 포트폴리오 ID */
  selectedPortfolioId: number | null;

  /** 포트폴리오 선택 */
  setSelectedPortfolioId: (id: number) => void;

  /** 포트폴리오 초기화 (로그아웃 등) */
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  selectedPortfolioId: null,

  setSelectedPortfolioId: (id: number) =>
    set({ selectedPortfolioId: id }),

  clearPortfolio: () =>
    set({ selectedPortfolioId: null }),
}));

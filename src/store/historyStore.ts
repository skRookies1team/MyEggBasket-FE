import { create } from 'zustand';
import api from '../store/axiosStore';

// --- Portfolio 타입 ---
export interface Portfolio {
    portfolioId: number;
    userId: number;
    name: string;
    totalAsset: number;
    cashBalance: number;
    riskLevel: string;
}

interface PortfolioState {
    portfolioList: Portfolio[];
    fetchPortfolios: () => Promise<void>;
}

// --- History 타입 ---
export interface HistoryReport {
    portfolioId: number;
    totalReturnRate: number;
    successRate: number;
}

const initialHistoryReport: HistoryReport = {
    portfolioId: 0,
    totalReturnRate: 0,
    successRate: 0,
};

interface HistoryState {
    historyReport: HistoryReport;
    fetchHistory: (portfolioId: number) => Promise<void>;
}

// //--- Holding state---
// export interface Holding {
//     holdingId: number,
//     portfolioId: number,
//     stockCode: string,
//     quantity: number,
//     avgPrice: number,
//     currentWeight: number,
//     targetWeight: number
// }
// const initialHolding: Holding = {
//     holdingId: 0,
//     portfolioId: 0,
//     stockCode: '',
//     quantity: 0,
//     avgPrice: 0,
// }
// interface HodingState{
//     holdingList: Holding[];
//     fetchHoldings: (portfolioId: number) => Promise<void>;
// }


// --- Portfolio Store ---
export const usePortfolioStore = create<PortfolioState>((set) => ({
    portfolioList: [],

    fetchPortfolios: async () => {
        try {
            const response = await api.get<Portfolio[]>(`/portfolios`);
            set({ portfolioList: response.data });
        } catch (error) {
            console.error('포트폴리오를 불러오는 중 오류:', error);
            set({ portfolioList: [] });
        }
    },
}));

// --- History Store ---
export const useHistoryStore = create<HistoryState>((set) => ({
    historyReport: initialHistoryReport,

    fetchHistory: async (portfolioId: number) => {
        try {
            const response = await api.get(`/portfolio/history/${portfolioId}`);

            const data = response.data;

            // 🔥 배열로 넘어오는 경우 처리
            const normalized =
                Array.isArray(data) && data.length > 0
                    ? data[0]                         // 첫 번째 요소 사용
                    : !Array.isArray(data) && data      // 객체면 그대로 사용
                        ? data
                        : initialHistoryReport;             // 그 외에는 초기값

            set({ historyReport: normalized });

        } catch (error) {
            console.error('히스토리 리포트를 불러오는 중 오류:', error);
            set({ historyReport: initialHistoryReport });
        }
    },
}));

//------holdingStore-------


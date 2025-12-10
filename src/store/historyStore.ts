import { create } from 'zustand';
import api from '../store/axiosStore'; // api 임포트는 그대로 둡니다.

// --- Portfolio 관련 타입 및 상태 ---
export interface Portfolio {
    portfolioId: number
    userId: number
    name: string
    totalAsset: number
    cashBalance: number
    riskLevel: string
}

interface PortfolioState {
    portfolioList: Portfolio[];
    fetchPortfolios: () => Promise<void>;
}

// --- History 관련 타입 및 상태 ---
export interface HistoryReport {
    portfolioId: number
    totalReturnRate: number;
    successRate: number;
}

// History의 초기 상태를 위한 기본값
const initialHistoryReport: HistoryReport = {
    portfolioId: 0,
    totalReturnRate: 0,
    successRate: 0,
};

// **[수정]** HistoryState의 상태 속성명을 historyReport로 통일
interface HistoryState {
    historyReport: HistoryReport 
    fetchHistory: (portfolioId: number) => Promise<void>;
}


// --- Zustand Stores ---

export const usePortfolioStore = create<PortfolioState>((set) => ({
    portfolioList: [],

    fetchPortfolios: async () => {
        try {
            const response = await api.get<Portfolio[]>(`/portfolios`); 

            set({ portfolioList: response.data });
        } catch (error) {
            console.error('포트폴리오를 불러오는 중 오류가 발생했습니다.', error);
            set({ portfolioList: [] }); 
        }
    },
}));


export const useHistoryStore = create<HistoryState>((set) => ({

    historyReport: initialHistoryReport, 

    fetchHistory: async (portfolioId: number) => {
        try {
            const response = await api.get<HistoryReport>(`/portfolio/history/${portfolioId}`);
            
            set({ historyReport: response.data }); 
        } catch (error) {
            console.error('히스토리 리포트를 불러오는 중 오류가 발생했습니다.', error);
            // **[수정]** 초기 상태를 initialHistoryReport로 변경 (오타 수정)
            set({ historyReport: initialHistoryReport }); 
        }
    },
}));
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
    holdings: Holding[];
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

//--- Holding state---
export interface Holding {
    holdingId: number,
    portfolioId: number,
    stockPrice: Stock,
    name:string
    quantity: number,
    avgPrice: number,
    currentWeight: number,
    targetWeight: number
}
interface HodingState{
    holdingList: Holding[];
    fetchHoldings: (portfolioId: number) => Promise<void>;
}
//StockPrice State
export interface Stock {
    stockCode: string;
    name: string;
    marketType: string;
    sector: string | null; 
    industryCode: string | null;
}
interface StockState{
    stock:Stock;
    fetchStock: (stockCode: string) => Promise<void>;

}


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

export const useHoldingStore = create<HodingState>((set) => ({
    holdingList: [],

    fetchHoldings: async (portfolioId: number) => {
        try {
            const responseHolding = await api.get<Holding[]>(`/portfolios/${portfolioId}/holdings`);
            set({ holdingList: responseHolding.data });
    
            
        } catch (error) {
            console.error('포트폴리오 내 보유 종목을 불러오는 중 오류:', error);
            set({ holdingList: [] });
        }
    },
}));

export const useStockStore = create<StockState>((set) => ({
    stock: {
        stockCode: '',
        name: '',
        marketType: '',
        sector: '',
        industryCode: '',
    },
    fetchStock: async (stockCode: string) => {
        try {
            const response = await api.get<Stock>(`kis/stocks/current-price/${stockCode}`);
            set({ stock: response.data });
        } catch (error) {
            console.error('주식 정보를 불러오는 중 오류:', error);
        }
    },
}));
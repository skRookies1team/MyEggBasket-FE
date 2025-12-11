import { create } from 'zustand';
import api from '../store/axiosStore';
import { fetchPortfolios } from '../api/portfolioApi';
import { fetchHoldings } from '../api/holdingApi';
import { fetchStockCurrentPrice } from '../api/liveStockApi';

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

//--- Holding state---
interface Stock{
    stockCode: string;
    name: string;
    marketType: string;
    sector: string;
    industryCode: string;
}

export interface Holding {
    holdingId: number,
    portfolioId: number,
    stock: Stock,
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
//StockCurrentPrice State
export interface StockCurrentPrice {
    stockCode: string;
    stockname: string;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
    volume: number;
    tradingValue:number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    closePrice:number;
}
interface StockCurrentPriceState{
    stockCurrentPrice:StockCurrentPrice;
    fetchStockCurrentPrice: (stockCode: string) => Promise<void>;
}
const initialStockCurrentPrice: StockCurrentPrice = {
    stockCode: '',
    stockname: '',
    currentPrice: 0,
    changeAmount: 0,
    changeRate: 0,
    volume: 0,
    tradingValue: 0,
    openPrice: 0,
    highPrice: 0,
    lowPrice: 0,
    closePrice: 0
};


// --- Portfolio Store ---
export const usePortfolioStore = create<PortfolioState>((set) => ({
    portfolioList: [],

    fetchPortfolios: async () => {
        try {
            const response = await fetchPortfolios()
            if (response) {
                set({ portfolioList: response.data });
            }
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
            const response = await fetchHoldings(portfolioId);
            if (response){
                set({ holdingList: response.data });
            }
        } catch (error) {
            console.error('포트폴리오 내 보유 종목을 불러오는 중 오류:', error);
            set({ holdingList: [] });
        }
    },
}));

export const useStockCurrentPriceStore = create<StockCurrentPriceState>((set) => ({
    stockCurrentPrice: initialStockCurrentPrice,

    fetchStockCurrentPrice: async (stockCode: string) => {
        try {
            const response = await fetchStockCurrentPrice(stockCode);
            if (response){
                set({ stockCurrentPrice: response.data });
            } 
        } catch (error) {
            console.error('주식 정보를 불러오는 중 오류:', error);
        }
    },
}));
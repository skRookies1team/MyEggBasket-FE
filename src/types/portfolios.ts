import type { Stock } from "../pages/historyStore";

export interface Portfolio {
    portfolioId: number;
    userId: number;
    name: string;
    totalAsset: number;
    cashBalance: number;
    riskLevel: string;
    holdings:Holding[]
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

export interface HistoryReport {
    portfolioId: number;
    totalReturnRate: number;
    successRate: number;
}

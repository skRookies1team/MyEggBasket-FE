import api from "../store/axiosStore";
import type { Holding } from "../types/portfolios";

interface newHolding {
    stockCode: string;
    quantity: number;
    avgPrice: number;
    currentWeight: number;
    targetWeight: number;
}

export async function fetchHoldings(portfolioId: number) {
    try {
        const response = await api.get<Holding[]>(`/portfolios/${portfolioId}/holdings`);
        return response;
    } catch (err) {
        console.error("❌ 보유 종목 조회 실패:", err);
        return null;

    }
}

export async function addHolding(portfolioId: number, data: newHolding) {
    try {
        const response = await api.post(`/portfolios/${portfolioId}/holdings`, data);
        return response;    
    } catch (err) {
        console.error("❌ 보유 종목 추가 실패:", err);
        return null;
    }
}
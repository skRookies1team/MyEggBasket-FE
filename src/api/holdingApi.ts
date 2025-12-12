import api from "../store/axiosStore";
import type { Holding } from "../types/portfolios";

export async function fetchHoldings(portfolioId: number){
    try{
        const response = await api.get<Holding[]>(`/portfolios/${portfolioId}/holdings`);
        return response;
    }catch(err){
        console.error("❌ 보유 종목 조회 실패:", err);
        return null;
    
    }
}
import api from "../store/axiosStore";
import type { Portfolio } from "../types/portfolios";

interface newPortfolio {
    name: string;
    riskLevel: string;
    totalAsset: number,
    cashBalance: number,
    stockCodes?: string[],
}

export async function fetchPortfolios() {
    try {
        const response = await api.get<Portfolio[]>(`/portfolios`);
        return response;
    } catch (err) {
        console.error("❌ 포트폴리오 조회 실패:", err);
        return null;
    }
}

export async function addPortfolio(newPortfolio: newPortfolio) {
    try {
        const response = await api.post(`/portfolios`, newPortfolio);
        return response.data;

    } catch (error) {
        // 3. 에러 발생 시 처리 (네트워크 문제, 서버 응답 4xx/5xx 등)
        console.error("포트폴리오 추가 실패:", error);
        throw error;
    }
}

export async function deletePortfolio(portfolioId: number) {
    try {
        const response = await api.delete(`/portfolios/${portfolioId}`);
        return response;
    } catch (err) {
        console.error("❌ 포트폴리오 삭제 실패:", err);
        return null;
    }
}
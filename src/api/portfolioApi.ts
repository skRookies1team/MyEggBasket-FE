import api from "../store/axiosStore";
import type { Portfolio } from "../store/historyStore";

export async function fetchPortfolios() {
    try {
        const response = await api.get<Portfolio[]>(`/portfolios`);
        return response;
    } catch (err) {
        console.error("❌ 포트폴리오 조회 실패:", err);
        return null;
    }
}
import api from "../store/axiosStore";

export async function fetchUpperTarget(stockCode: string, targetPrice: number) {
    try {
        const data = { stockCode, targetPrice }; 
        const response = await api.post(`price-targets/upper`, data);
        return response;
    } catch (err) {
        console.error("❌ 상한 목표가 추가 실패:", err);
        return null;
    }
}

export async function fetchLowerTarget(stockCode: string, targetPrice: number) {
    try {
        const data = { stockCode, targetPrice };
        const response = await api.post(`price-targets/lower`, data);
        return response;
    } catch (err) {
        console.error("❌ 하한 목표가 추가 실패:", err);
        return null;
    }
}

export async function fetchPriceTargets(){
    try{
        const response = await api.get(`price-targets`);
        return response.data;
    } catch (err) {
        console.error("❌ 목표가 조회 실패:", err);
        return null;    
    }
}
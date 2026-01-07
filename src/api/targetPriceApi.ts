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

// 전체 조회
export async function fetchPriceTargets() {
    try {
        const response = await api.get(`price-targets`);
        return response.data;
    } catch (err) {
        console.error("❌ 목표가 목록 조회 실패:", err);
        return null;
    }
}

// [신규] 특정 종목 목표가 조회 (백엔드: GET /api/app/price-targets/{stockCode})
export async function fetchTargetPriceByCode(stockCode: string) {
    try {
        const response = await api.get(`price-targets/${stockCode}`);
        return response.data;
    } catch (err) {
        // 404 등 에러 발생 시 설정된 목표가가 없는 것으로 처리
        return null;
    }
}
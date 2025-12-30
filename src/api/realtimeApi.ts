import api from "../store/axiosStore";

export function subscribeRealtimePrice(
    stockCode: string,
    virtual: boolean = false
) {
  // [수정] 백엔드 컨트롤러(@GetMapping("/current-price/{stockCode}")) 경로로 변경
  return api.get(`/kis/stock/current-price/${stockCode}`, {
    params: { useVirtualServer: virtual }, // 파라미터명도 useVirtualServer로 맞춤
  });
}

export const registerStockSubscription = async (stockCode: string) => {
  // [유지] 사용자 요청대로 INTEREST 타입 사용
  return await api.post(`/subscriptions`, {
    stockCode,
    type: "INTEREST"
  });
};
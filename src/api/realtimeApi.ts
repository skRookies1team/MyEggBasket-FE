import api from "../store/axiosStore";

export function subscribeRealtimePrice(
    stockCode: string,
    virtual: boolean = false
) {
  // 가상 서버 여부 등 파라미터 확인
  return api.get(`/kis/realtime/price/${stockCode}`, {
    params: { virtual },
  });
}

export const registerStockSubscription = async (stockCode: string) => {
  return await api.post(`/subscriptions`, {
    stockCode,
    type: "INTEREST"
  });
};
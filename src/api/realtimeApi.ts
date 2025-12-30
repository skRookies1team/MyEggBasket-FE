import api from "../store/axiosStore";

export function subscribeRealtimePrice(
  stockCode: string,
  virtual: boolean = false
) {
  return api.get(`/kis/realtime/price/${stockCode}`, {
    params: { virtual },
  });
}

export const registerStockSubscription = async (stockCode: string) => {
  // 사용자가 보고 있는 종목을 'view' 타입으로 구독 요청
  return await api.post(`/subscriptions`, {
    stockCode,
    type: "INTEREST" // 조회용 구독임을 명시
  });
};
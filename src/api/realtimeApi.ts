import api from "../store/axiosStore";

export function subscribeRealtimePrice(
  stockCode: string,
  virtual: boolean = false
) {
  return api.get(`/kis/realtime/price/${stockCode}`, {
    params: { virtual },
  });
}

import api from "../store/axiosStore";

export async function fetchUserBalance(virtual = false) {
  try {
    const res = await api.get(`/kis/trade/balance?virtual=${virtual}`);
    return res.data;
  } catch (err) {
    console.error("❌ 잔고 조회 실패:", err);
    return null;
  }
}

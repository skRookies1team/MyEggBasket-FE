import api from "../store/axiosStore"; // 네가 쓰는 axios 인스턴스

export async function AiBubbleChart() {
  const res = await api.get("/ai/keywords/trending");
  return res.data;
}

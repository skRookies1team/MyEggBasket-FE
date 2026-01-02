import api from "../store/axiosStore"

export const AiBubbleChart = async () => {
    try {
        const res = await api.get(`ai/keywords/trending`)
        return res.data
    } catch (err) {
        console.error("❌ AI chart data 불러오기 실패:", err);
        return null;
    }
}
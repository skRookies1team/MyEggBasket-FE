import api from "../store/axiosStore";

// 실시간 websocket
export async function fetchRealtimePrice(stockCode:string){
    const response = await api.get(`/kis/realtime/price/${stockCode}`);
    if(response){
        return response.data;
    }
}
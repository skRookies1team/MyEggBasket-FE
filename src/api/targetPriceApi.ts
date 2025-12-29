import api from "../store/axiosStore";


export async function fetchUpperTarget(stockCode:string, price:string){
    try{
        const data = {stockCode, price}
        const response = await api.post(`price-targets/upper`,data)
        return response;
    } catch(err){
        console.error("❌  상한 목표가 추가 실패:", err);
        return null;
    }
}

export async function fetchLowerTarget(stockCode:string, price:string){
    try{
        const data = {stockCode, price}
        const response = await api.post(`price-targets/lower`,data)
        return response;
    } catch(err){
        console.error("❌  하한 목표가 추가 실패:", err);
        return null;
    }
}
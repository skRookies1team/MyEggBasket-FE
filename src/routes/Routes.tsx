// src/routes/Routes.tsx
import { Routes, Route } from "react-router-dom";
import StockDetailPage from "../pages/StockDetailPage.tsx";
import type { StockDetailData } from '../types/stock';
import { useRealtimeStock } from '../hooks/useRealtimeStock.ts'; // 훅 import 추가

const handleBack = () => {
    console.log("Back button clicked! (Go back logic here)");
};


export default function Router() {
    // 실시간 데이터 훅 사용
    const realtimeData = useRealtimeStock();

    const hasRealtime = realtimeData.currentPrice !== 0;

    // 최소한의 combinedData를 실시간 기반으로 생성 (목데이터 사용 안함)
    const combinedData: StockDetailData = {
        currentPrice: realtimeData.currentPrice,
        changeAmount: realtimeData.changeAmount,
        changeRate: realtimeData.changeRate,
        chartData: [],
        orderBook: { sell: [], buy: [] },
        news: [],
        financials: { revenue: [], profit: [] },
        reports: [],
    } as StockDetailData;

    // 실시간 포인트 객체: StockDetailPage에서 분봉 실시간 업데이트에 사용
    const realtimePoint = hasRealtime
        ? {
            price: realtimeData.currentPrice,
            volume: realtimeData.acml_vol ?? 0,
            time: new Date().toISOString(),
        }
        : undefined;

    // 실시간 추가 정보 (호가/누적거래량 등) 전달
    const realtimeInfo = hasRealtime
        ? {
            askp1: realtimeData.askp1,
            bidp1: realtimeData.bidp1,
            acml_vol: realtimeData.acml_vol,
            time: new Date().toISOString(),
        }
        : undefined;


    return (
        <>
            <Routes>
                <Route path="*" element={<div style={{ padding: 24 }}>No match</div>} />
                <Route
                    path="/"
                    element={
                        <StockDetailPage
                             stockName="삼성전자 주식 (005930)"
                             data={combinedData}
                             onBack={handleBack}
                             isLoading={!hasRealtime} // 실시간 없을 땐 로딩 UI 허용
                             realtimePoint={realtimePoint}
                             realtimeInfo={realtimeInfo}
                        />
                    }
                />
            </Routes>
        </>
    );
}

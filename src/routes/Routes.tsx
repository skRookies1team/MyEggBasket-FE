// src/routes/Routes.tsx
import { Routes, Route } from "react-router-dom";
import StockDetailPage from "../pages/StockDetailPage.tsx";
import type { StockDetailData } from '../types/stock';
import { useRealtimeStock } from '../hooks/useRealtimeStock.ts'; // 훅 import 추가
import { useRef, useMemo } from 'react';

const handleBack = () => {
    console.log("Back button clicked! (Go back logic here)");
};


export default function Router() {
    // 실시간 데이터 훅 사용 (realtimeData, connected, loading 반환)
    const { realtimeData, loading } = useRealtimeStock();
    // 뉴스 배열은 빈 배열로 고정 (실시간 데이터 변경 시 재생성되지 않도록)
    const newsRef = useRef([]);

    const combinedData: StockDetailData = useMemo(() => ({
        currentPrice: realtimeData.currentPrice,
        changeAmount: realtimeData.changeAmount,
        changeRate: realtimeData.changeRate,
        chartData: [],
        orderBook: { sell: [], buy: [] },
        news: newsRef.current, // 안정된 참조
        financials: { revenue: [], profit: [] },
        reports: [],
    }), [realtimeData.currentPrice, realtimeData.changeAmount, realtimeData.changeRate]);

    const hasRealtime = realtimeData && realtimeData.currentPrice !== 0;

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
                             isLoading={loading} // useRealtimeStock의 loading 상태로 제어
                             realtimePoint={realtimePoint}
                             realtimeInfo={realtimeInfo}
                        />
                    }
                />
            </Routes>
        </>
    );
}

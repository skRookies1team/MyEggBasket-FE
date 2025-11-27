// src/routes/Router.tsx
import { Routes, Route } from "react-router-dom";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import StockDetailPage from "../pages/StockDetailPage";
import MyPage from "../pages/MyPage";
import type { StockDetailData } from "../types/stock";
import { useRealtimeStock } from "../hooks/useRealtimeStock";
import { useRef, useMemo } from "react";
import PrivateRoute from "../routes/PrivateRoute";
import Layout from "../components/Layout";

const handleBack = () => {
  console.log("Back button clicked!");
};

export default function Router() {
  const { realtimeData, loading } = useRealtimeStock();

  const newsRef = useRef([]);

  const combinedData: StockDetailData = useMemo(
    () => ({
      currentPrice: realtimeData.currentPrice,
      changeAmount: realtimeData.changeAmount,
      changeRate: realtimeData.changeRate,
      chartData: [],
      orderBook: { sell: [], buy: [] },
      news: newsRef.current,
      financials: { revenue: [], profit: [] },
      reports: [],
    }),
    [
      realtimeData.currentPrice,
      realtimeData.changeAmount,
      realtimeData.changeRate,
    ]
  );

  const hasRealtime = realtimeData && realtimeData.currentPrice !== 0;

  const realtimePoint = hasRealtime
    ? {
        price: realtimeData.currentPrice,
        volume: realtimeData.acml_vol ?? 0,
        time: new Date().toISOString(),
      }
    : undefined;

  const realtimeInfo = hasRealtime
    ? {
        askp1: realtimeData.askp1,
        bidp1: realtimeData.bidp1,
        acml_vol: realtimeData.acml_vol,
        time: new Date().toISOString(),
      }
    : undefined;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/mypage" element={<MyPage />} />
          <Route
            path="/stock"
            element={
              <StockDetailPage
                stockName="삼성전자 주식 (005930)"
                data={combinedData}
                onBack={handleBack}
                isLoading={loading}
                realtimePoint={realtimePoint}
                realtimeInfo={realtimeInfo}
              />
            }
          />
          <Route
            path="*"
            element={<div style={{ padding: 24 }}>No match</div>}
          />
        </Route>
      </Routes>
    </Layout>
  );
}

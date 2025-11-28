// src/routes/Router.tsx
import { Routes, Route, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import StockDetailPage from "../pages/StockDetailPage";
import {PortfolioPage} from "../pages/PortfolioPage.tsx";
import MyPage from "../pages/MyPage";
import type { StockDetailData } from "../types/stock";
import { useRealtimeStock } from "../hooks/useRealtimeStock";
import { useRef, useMemo } from "react";
import PrivateRoute from "../routes/PrivateRoute";
import Layout from "../components/Layout";

export default function Router() {
  const stockCode = "";
  const { realtimeData } = useRealtimeStock(stockCode);
  const navigate = useNavigate(); // 네비게이션 함수 생성
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
      <Nav/>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route element={<PrivateRoute />}>
          <Route
                    path="/portfolio"
                    element={<PortfolioPage onNavigateToHistory={() => navigate('/history')} />}
                />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/stock/:code" element={<StockDetailPage />} />
          <Route
            path="*"
            element={<div style={{ padding: 24 }}>No match</div>}
          />
        </Route>
      </Routes>
    </Layout>
  );
}

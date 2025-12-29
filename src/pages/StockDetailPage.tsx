import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { StockHeader } from "../components/stock/StockHeader";
import { StockChart } from "../components/stock/StockChart";
import { StockTabNav } from "../components/stock/StockTabNav";
import { StockNews } from "../components/stock/StockNews";
import { StockReports } from "../components/stock/StockReports";
import { StockFinancials } from "../components/stock/StockFinancials";

import type {
  StockDetailData,
  Period,
  TabType,
  StockCandle,
  StockCurrentPrice,
  OrderBookData,
} from "../types/stock";

import { useRealtimePrice } from "../hooks/useRealtimeStock";
import { fetchHistoricalData, getStockInfoFromDB } from "../api/stocksApi";
import { fetchStockCurrentPrice } from "../api/liveStockApi";
import { subscribeRealtimePrice } from "../api/realtimeApi";
import { useRealtimeOrderBook } from "../hooks/useRealtimeOrderBook";

/* ------------------------------------------------------------------ */
/* Container */
/* ------------------------------------------------------------------ */
export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const stockCode = code ?? "005930";

  const [period, setPeriod] = useState<Period>("day");

  /* 1. 실시간 가격 및 호가 데이터 연결 */
  const realtimeData = useRealtimePrice(stockCode, period === "minute");
  const orderBookData = useRealtimeOrderBook(stockCode); // 실시간 호가 수신 훅

  const subscribedRef = useRef(false);

  useEffect(() => {
    if (period !== "minute") {
      subscribedRef.current = false;
      return;
    }
    if (subscribedRef.current) return;
    subscribedRef.current = true;
    subscribeRealtimePrice(stockCode).catch(console.error);
  }, [period, stockCode]);

  const [restInfo, setRestInfo] = useState<StockCurrentPrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchStockCurrentPrice(stockCode)
      .then((res) => mounted && setRestInfo(res))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [stockCode]);

  const combinedData: StockDetailData = useMemo(
    () => ({
      currentPrice: realtimeData?.price ?? restInfo?.currentPrice ?? 0,
      changeAmount: realtimeData?.diff ?? restInfo?.changeAmount ?? 0,
      changeRate: realtimeData?.diffRate ?? restInfo?.changeRate ?? 0,
      chartData: [],
      news: [],
      financials: { revenue: [], profit: [] },
      reports: [],
    }),
    [realtimeData, restInfo]
  );

  return (
    <StockDetailView
      stockCode={stockCode}
      data={combinedData}
      orderBook={orderBookData} // 호가 데이터 전달
      period={period}
      onPeriodChange={setPeriod}
      onBack={() => navigate(-1)}
      isLoading={loading}
    />
  );
}

/* ------------------------------------------------------------------ */
/* View */
/* ------------------------------------------------------------------ */
function StockDetailView({
  stockCode,
  data,
  orderBook, // 상위에서 전달받음
  period,
  onPeriodChange,
  onBack,
  isLoading,
}: {
  stockCode: string;
  data: StockDetailData;
  orderBook?: OrderBookData;
  period: Period;
  onPeriodChange: (p: Period) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("chart");
  const [historicalData, setHistoricalData] = useState<StockCandle[]>([]);
  const [stockName, setStockName] = useState<string>("");

  useEffect(() => {
    if (period === "minute") return;
    fetchHistoricalData(stockCode, period)
      .then(setHistoricalData)
      .catch(console.error);
  }, [period, stockCode]);

  useEffect(() => {
    getStockInfoFromDB(stockCode).then((dbData) => {
      setStockName(dbData?.name || "");
    });
  }, [stockCode]);

  const displayChartData = useMemo(
    () => [...historicalData].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    [historicalData]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-gray-400">
        데이터 로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24 mt-6">
      {/* Header */}
      <StockHeader
        stockCode={stockCode}          
        stockName={stockName || stockCode}
        currentPrice={data.currentPrice}
        changeAmount={data.changeAmount}
        changeRate={data.changeRate}
        onBack={onBack}
        isLive={period === "minute"}
        acmlVol={0}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-[#232332] bg-[#0a0a0f]">
        <StockTabNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        {activeTab === "chart" && (
          <div className="rounded-2xl bg-[#1a1a24] p-4 shadow">
            {/* 호가 데이터를 차트 컴포넌트 내부로 전달합니다. 
                차트 내부의 ChartLayout에서 이 데이터를 사용하여 호가를 그립니다.
            */}
            <StockChart
              data={displayChartData}
              period={period}
              onPeriodChange={onPeriodChange}
              orderBook={orderBook}
              currentPrice={data.currentPrice}
              stockCode={stockCode}
            />
          </div>
        )}

        {activeTab === "news" && (
          <div className="rounded-2xl bg-[#1a1a24] p-4 shadow">
            <StockNews data={data.news} query={stockCode} />
          </div>
        )}

        {activeTab === "info" && (
          <div className="rounded-2xl bg-[#1a1a24] p-4 shadow">
            <StockFinancials stockCode={stockCode} />
          </div>
        )}

        {activeTab === "report" && (
          <div className="rounded-2xl bg-[#1a1a24] p-4 shadow">
            <StockReports data={data.reports} />
          </div>
        )}
      </div>
    </div>
  );
}

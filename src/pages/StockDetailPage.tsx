import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StockHeader } from '../components/stock/StockHeader';
import { StockChart } from '../components/stock/StockChart';
import { StockOrderBook } from '../components/stock/StockOrderBook';
import { StockIndicators } from '../components/stock/StockIndicators';
import { StockTabNav } from '../components/stock/StockTabNav';
import { StockNews } from '../components/stock/StockNews';
import { StockReports } from '../components/stock/StockReports';

import type {
  StockDetailData,
  Period,
  TabType,
  StockCandle,
  StockCurrentPrice,
} from "../types/stock";

import { useRealtimePrice } from '../hooks/useRealtimeStock';
import { fetchHistoricalData } from '../api/stocksApi';
import { fetchStockCurrentPrice } from '../api/liveStockApi';
import { subscribeRealtimePrice } from '../api/realtimeApi';
import { StockFinancials } from '../components/stock/StockFinancials';

/* ------------------------------------------------------------------ */
/* 타입 유틸 */
/* ------------------------------------------------------------------ */
type HistoryPeriod = Exclude<Period, "minute">;
const isHistoryPeriod = (p: Period): p is HistoryPeriod => p !== "minute";

/* ------------------------------------------------------------------ */
/* [Container] */
/* ------------------------------------------------------------------ */
export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const stockCode = code ?? "005930";

  /* ------------------ period ------------------ */
  const [period, setPeriod] = useState<Period>("day");

  /* ------------------ realtime price (minute only) ------------------ */
  const realtimeData = useRealtimePrice(
    stockCode,
    period === "minute"
  );

  /* ------------------ minute subscribe ------------------ */
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

  /* ------------------ REST current price ------------------ */
  const [restInfo, setRestInfo] = useState<StockCurrentPrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchStockCurrentPrice(stockCode)
      .then((res) => mounted && setRestInfo(res))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [stockCode]);

  /* ------------------ header data ------------------ */
  const combinedData: StockDetailData = useMemo(
    () => ({
      currentPrice:
        realtimeData?.price ??
        restInfo?.currentPrice ??
        0,

      changeAmount:
        realtimeData?.diff ??
        restInfo?.changeAmount ??
        0,

      changeRate:
        realtimeData?.diffRate ??
        restInfo?.changeRate ??
        0,

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
      period={period}
      onPeriodChange={setPeriod}
      onBack={() => navigate(-1)}
      isLoading={loading}
    />
  );
}

/* ------------------------------------------------------------------ */
/* [View] */
/* ------------------------------------------------------------------ */
function StockDetailView({
  stockCode,
  data,
  period,
  onPeriodChange,
  onBack,
  isLoading,
}: {
  stockCode: string;
  data: StockDetailData;
  period: Period;
  onPeriodChange: (p: Period) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("chart");
  const [historicalData, setHistoricalData] = useState<StockCandle[]>([]);

  /* ------------------ historical chart data ------------------ */
  useEffect(() => {
    if (!isHistoryPeriod(period)) return;

    fetchHistoricalData(stockCode, period)
      .then(setHistoricalData)
      .catch(console.error);
  }, [period, stockCode]);

  const displayChartData = useMemo(
    () =>
      [...historicalData].sort(
        (a, b) =>
          new Date(a.time).getTime() -
          new Date(b.time).getTime()
      ),
    [historicalData]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-20">
      <StockHeader
        stockName={stockCode}
        currentPrice={data.currentPrice}
        changeAmount={data.changeAmount}
        changeRate={data.changeRate}
        onBack={onBack}
        isLive={period === "minute"}
        acmlVol={0}
      />

      <StockTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="max-w-[1600px] mx-auto p-6">
        {activeTab === "chart" && (
          <StockChart
            data={displayChartData}
            period={period}
            onPeriodChange={onPeriodChange}
          />
        )}

        {activeTab === "news" && (
          <StockNews data={data.news} query={stockCode} />
        )}

        {activeTab === 'info' && (
          <StockFinancials
            stockCode={stockCode}
          />
        )}

        {activeTab === "report" && (
          <StockReports data={data.reports} />
        )}
      </div>
    </div>
  );
}

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
  S3ReportItem,
} from "../types/stock";

import { useRealtimePrice, type RealtimePricePayload } from "../hooks/useRealtimeStock"; // RealtimePricePayload 타입 임포트 확인
import { fetchHistoricalData, getStockInfoFromDB } from "../api/stocksApi";
import { fetchStockCurrentPrice } from "../api/liveStockApi";
import { subscribeRealtimePrice, registerStockSubscription } from "../api/realtimeApi";

/* ------------------------------------------------------------------ */
/* 타입 유틸 */
/* ------------------------------------------------------------------ */
type HistoryPeriod = Exclude<Period, "minute">;
const isHistoryPeriod = (p: Period): p is HistoryPeriod => p !== "minute";

/* ------------------------------------------------------------------ */
/* Container */
/* ------------------------------------------------------------------ */
export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const stockCode = code ?? "005930";
  const [period, setPeriod] = useState<Period>("day");

  /* realtime (minute only) */
  const realtimeData = useRealtimePrice(
    stockCode,
    period === "minute"
  );

    /* minute subscribe (분봉 데이터 요청 트리거 - 필요 시 유지) */
    const subscribedRef = useRef(false);
    useEffect(() => {
        if (!stockCode) return;
        if (period !== "minute") {
            subscribedRef.current = false;
            return;
        }
        if (subscribedRef.current) return;

        subscribedRef.current = true;
        subscribeRealtimePrice(stockCode).catch(console.error);
    }, [period, stockCode]);

    /* REST current price (초기 로딩용) */
    const [restInfo, setRestInfo] = useState<StockCurrentPrice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!stockCode) return;

        let mounted = true;
        fetchStockCurrentPrice(stockCode)
            .then((res) => mounted && setRestInfo(res))
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [stockCode]);

    /* header data merge */
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

    if (!stockCode) {
        return <div className="p-10 text-center text-white">잘못된 접근입니다.</div>;
    }
    if (subscribedRef.current) return;

    subscribedRef.current = true;
    subscribeRealtimePrice(stockCode).catch(console.error);
  }, [period, stockCode]);

  /* REST current price */
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

  /* header data (reports ❌ 포함 안 함) */
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
            realtimeData={realtimeData} // [추가] View로 실시간 데이터 전달
        />
    );
}

/* ------------------------------------------------------------------ */
/* View */
/* ------------------------------------------------------------------ */
function StockDetailView({
                             stockCode,
                             data,
                             period,
                             onPeriodChange,
                             onBack,
                             isLoading,
                             realtimeData, // [추가] Props 받기
                         }: {
    stockCode: string;
    data: StockDetailData;
    period: Period;
    onPeriodChange: (p: Period) => void;
    onBack: () => void;
    isLoading: boolean;
    realtimeData: RealtimePricePayload | null; // [추가] 타입 정의
}) {
  const [activeTab, setActiveTab] = useState<TabType>("chart");
  const [historicalData, setHistoricalData] = useState<StockCandle[]>([]);
  const [stockName, setStockName] = useState<string>("");

  /* 🔹 S3 리포트 */
  const [reports, setReports] = useState<S3ReportItem[]>([]);

  const REPORTS_BASE =
    "https://eggstockbasket.s3.ap-northeast-2.amazonaws.com/reports";

  /* historical chart */
  useEffect(() => {
    if (!isHistoryPeriod(period)) return;

    fetchHistoricalData(stockCode, period)
      .then(setHistoricalData)
      .catch(console.error);
  }, [period, stockCode]);

  /* stock name */
  useEffect(() => {
    getStockInfoFromDB(stockCode).then((info) =>
      setStockName(info?.name || "")
    );
  }, [stockCode]);

  /* reports.json */
  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch(`${REPORTS_BASE}/reports.json`);
        const json = await res.json();
        setReports(json.stocks?.[stockCode] ?? []);
      } catch (e) {
        console.error("Failed to load reports", e);
        setReports([]);
      }
    };

    loadReports();
  }, [stockCode]);

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-gray-400">
        데이터 로딩 중...
      </div>
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
      <StockHeader
        stockCode={stockCode}
        stockName={stockName || stockCode}
        currentPrice={data.currentPrice}
        changeAmount={data.changeAmount}
        changeRate={data.changeRate}
        onBack={onBack}
        isLive={true}
        acmlVol={realtimeData?.volume || 0}
      />

      <div className="border-b border-[#232332] bg-[#0a0a0f]">
        <StockTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-6">
        {activeTab === "chart" && (
          <div className="rounded-2xl bg-[#1a1a24] p-4 shadow">
            <StockChart
              data={displayChartData}
              period={period}
              onPeriodChange={onPeriodChange}
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
            <StockReports data={reports} />
          </div>
        )}
      </div>
    </div>
  );
}

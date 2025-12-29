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
    const navigate = useNavigate();

    const { stockCode = "" } = useParams<{ stockCode: string }>();
    const [period, setPeriod] = useState<Period>("day");

    // [구독 요청] 상세 페이지 진입 시 조회용(VIEW) 구독 이벤트 전송
    useEffect(() => {
        if (stockCode) {
            registerStockSubscription(stockCode).catch((err) => {
                console.error("실시간 구독 갱신 실패:", err);
            });
        }
    }, [stockCode]);

    /* realtime (데이터 수신) */
    const realtimeData = useRealtimePrice(
        stockCode,
        true // 항상 수신 (차트 및 헤더 업데이트용)
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

    /* 1. 초기 차트 데이터 로딩 */
    useEffect(() => {
        if (!stockCode) return;
        // 분봉이 아니거나 등등의 조건은 비즈니스 로직에 맞게 유지
        // 여기서는 일단 모든 period에 대해 데이터를 불러온다고 가정
        fetchHistoricalData(stockCode, period)
            .then(setHistoricalData)
            .catch(console.error);
    }, [period, stockCode]);

    /* 2. [핵심] 실시간 데이터 수신 시 차트 데이터 갱신 */
    useEffect(() => {
        // realtimeData가 없거나 과거 데이터가 로드되지 않았으면 중단
        if (!realtimeData || historicalData.length === 0) return;

        setHistoricalData((prev) => {
            if (prev.length === 0) return prev; // 방어 코드

            // 불변성 유지를 위해 배열 복사
            const newData = [...prev];
            const lastIndex = newData.length - 1;
            const lastCandle = newData[lastIndex];

            // 실시간 데이터로 마지막 캔들 업데이트 로직
            // (참고: 시가, 고가, 저가, 종가 갱신 로직이 필요할 수 있습니다)
            const updatedCandle = {
                ...lastCandle,
                close: realtimeData.price, // 현재가 업데이트
                // 고가 갱신: 현재가가 기존 고가보다 높으면 교체
                high: Math.max(lastCandle.high, realtimeData.price),
                // 저가 갱신: 현재가가 기존 저가보다 낮으면 교체
                low: Math.min(lastCandle.low, realtimeData.price),
                volume: lastCandle.volume + realtimeData.volume // 거래량 누적 (필요시)
            };

            newData[lastIndex] = updatedCandle;
            return newData;
        });

// 중요: 의존성 배열에서 historicalData를 제거하고 realtimeData만 남깁니다.
    }, [realtimeData]);

    /* 종목 이름 로딩 */
    useEffect(() => {
        if (!stockCode) return;
        const loadStockInfo = async () => {
            const info = await getStockInfoFromDB(stockCode);
            setStockName(info?.name || "");
        };
        loadStockInfo();
    }, [stockCode]);

    const displayChartData = useMemo(
        () =>
            [...historicalData].sort(
                (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
            ),
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
        isLive={true}
        acmlVol={realtimeData?.volume || 0}
      />

      {/* Tabs */}
      <div className="border-b border-[#232332] bg-[#0a0a0f]">
        <StockTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Content */}
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
            <StockReports data={data.reports} />
          </div>
        )}
      </div>
    </div>
  );
}

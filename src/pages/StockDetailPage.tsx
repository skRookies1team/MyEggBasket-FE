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
  OrderBookData,
} from "../types/stock";

// RealtimePricePayload 타입 import 추가
import { useRealtimePrice, type RealtimePricePayload } from "../hooks/useRealtimeStock";
import { fetchHistoricalData, getStockInfoFromDB } from "../api/stocksApi";
import { fetchStockCurrentPrice } from "../api/liveStockApi";
import { subscribeRealtimePrice, registerStockSubscription } from "../api/realtimeApi";
import { useRealtimeOrderBook } from "../hooks/useRealtimeOrderBook";

/* ------------------------------------------------------------------ */
/* Container */
/* ------------------------------------------------------------------ */
export default function StockDetailPage() {
  const params = useParams();
  const navigate = useNavigate();

  const stockCode = params.stockCode || params.code || "005930";
  const [period, setPeriod] = useState<Period>("day");

  /* realtime (minute only) */
  const realtimeData = useRealtimePrice(stockCode, true);
  const orderBookData = useRealtimeOrderBook(stockCode);

  /* minute subscribe */
  const subscribedRef = useRef(false);
  useEffect(() => {
    if (period !== "minute") {
      subscribedRef.current = false;
      return;
    }
    if (subscribedRef.current) return;

    subscribedRef.current = true;
    // 실패해도 조용히 처리 (콘솔 에러 방지)
    subscribeRealtimePrice(stockCode).catch((e) => console.warn("Realtime sub failed", e));
  }, [period, stockCode]);

  /* ==============================
     최근 본 주식 저장
  ============================== */
  useEffect(() => {
    if (!stockCode) return;

    const key = "recent_stocks";
    const MAX = 10;

    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem(key) || "[]"
      );

      // 중복 제거 + 최신 맨 앞으로
      const updated = [
        stockCode,
        ...stored.filter((c) => c !== stockCode),
      ].slice(0, MAX);

      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save recent stock", e);
    }
  }, [stockCode]);


  useEffect(() => {
    if (stockCode) {
      registerStockSubscription(stockCode)
        .then(() => {
          console.log(`[StockDetailPage] Subscription (VIEW) success for ${stockCode}`);
        })
        .catch((err) => {
          // 409 Conflict는 이미 구독중이라는 의미일 수 있으므로 warn 처리
          console.warn("[StockDetailPage] Subscription warning:", err);
        });
    }
  }, [stockCode]);

  useEffect(() => {
    if (period !== "minute") {
      subscribedRef.current = false;
      return;
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
      .catch((e) => console.error("Current price fetch failed", e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [stockCode]);

  /* header data */
  const combinedData: StockDetailData = useMemo(
    () => ({
      // 실시간 데이터 우선 사용
      currentPrice: realtimeData?.price ?? restInfo?.currentPrice ?? 0,
      changeAmount: realtimeData?.diff ?? restInfo?.changeAmount ?? 0,
      changeRate: realtimeData?.diffRate ?? restInfo?.changeRate ?? 0,

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
      orderBook={orderBookData} // 호가 데이터 전달
      period={period}
      onPeriodChange={setPeriod}
      onBack={() => navigate(-1)}
      isLoading={loading}
      realtimeData={realtimeData} // 실시간 데이터 전달
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
  realtimeData,
}: {
  stockCode: string;
  data: StockDetailData;
  orderBook?: OrderBookData;
  period: Period;
  onPeriodChange: (p: Period) => void;
  onBack: () => void;
  isLoading: boolean;
  realtimeData: RealtimePricePayload | null;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("chart");
  const [historicalData, setHistoricalData] = useState<StockCandle[]>([]);
  const [stockName, setStockName] = useState<string>("");

  /* 🔹 S3 리포트 상태 */
  const [reports, setReports] = useState<S3ReportItem[]>([]);

  const REPORTS_BASE =
    "https://eggstockbasket.s3.ap-northeast-2.amazonaws.com/reports";

  /* historical chart data */
  useEffect(() => {
    // period 변경 시 데이터 새로 로드
    fetchHistoricalData(stockCode, period)
      .then(setHistoricalData)
      .catch((err) => {
        console.warn("Historical Data Fetch Error:", err);
        setHistoricalData([]); // 실패시 빈 배열
      });
  }, [period, stockCode]);

  /* 🔹 실시간 데이터 반영 (차트 갱신: 새 캔들 추가 or 마지막 캔들 업데이트) */
  useEffect(() => {
    if (!realtimeData || !realtimeData.price || historicalData.length === 0) return;

    setHistoricalData((prev) => {
      if (prev.length === 0) return prev;

      const lastIndex = prev.length - 1;
      const lastCandle = prev[lastIndex];
      const currentPrice = realtimeData.price;
      const tickTime = realtimeData.tickTime; // ex: "120130" (HHmmss) or ISO String

      // 시간 비교를 위한 헬퍼 함수 (안전하게 숫자만 추출)
      const getMinuteKey = (t: string) => {
        const clean = t.replace(/\D/g, "");
        // HHmmss (6자리) -> HHmm
        if (clean.length === 6) return clean.substring(0, 4);
        // YYYYMMDDHHmmss... (ISO 등) -> HHmm 추출 (8~12 index)
        if (clean.length >= 12) return clean.substring(8, 12);
        return clean;
      };

      let isNewCandle = false;

      // 분봉(minute)이고, 시간이 '분' 단위로 바뀌었으면 새 캔들
      if (period === "minute" && tickTime) {
        const lastTimeKey = getMinuteKey(lastCandle.time);
        const currentTimeKey = getMinuteKey(tickTime);

        // 시간이 존재하고, 현재 시간이 더 크면 새 캔들
        if (currentTimeKey && lastTimeKey && Number(currentTimeKey) > Number(lastTimeKey)) {
          isNewCandle = true;
        }
      }

      if (isNewCandle) {
        // [CASE 1] 새 분봉 생성
        const newCandle: StockCandle = {
          time: tickTime, // 원본 string 유지 (PriceChart에서 변환)
          open: currentPrice,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
          volume: 0,
        };
        return [...prev, newCandle];
      } else {
        // [CASE 2] 현재 캔들 업데이트 (일봉 포함)
        const newCandle = {
          ...lastCandle,
          close: currentPrice,
          high: Math.max(lastCandle.high, currentPrice),
          low: Math.min(lastCandle.low, currentPrice),
          // 일봉(day)일 때는 누적 거래량 업데이트, 분봉일 때는 기존값 유지
          volume: period === "day" ? realtimeData.volume : lastCandle.volume,
        };

        const nextData = [...prev];
        nextData[lastIndex] = newCandle;
        return nextData;
      }
    });
  }, [realtimeData, period]); // period가 바뀌면 로직이 달라지므로 의존성 추가

  /* stock name */
  useEffect(() => {
    const loadStockInfo = async () => {
      try {
        const info = await getStockInfoFromDB(stockCode);
        setStockName(info?.name || "");
      } catch (e) {
        console.warn("Stock Info Load Failed", e);
      }
    };
    loadStockInfo();
  }, [stockCode]);

  /* 🔹 reports.json 로드 */
  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch(`${REPORTS_BASE}/reports.json`);
        if (!res.ok) throw new Error("Report fetch failed");
        const json = await res.json();
        setReports(json.stocks?.[stockCode] ?? []);
      } catch (e) {
        // report 로드 실패는 조용히 무시
        setReports([]);
      }
    };

    loadReports();
  }, [stockCode]);

  const displayChartData = useMemo(
    () =>
      [...historicalData].sort(
        (a, b) => {
          // 안전한 정렬을 위해 문자열/날짜 모두 고려
          const timeA = new Date(a.time).getTime() || 0;
          const timeB = new Date(b.time).getTime() || 0;
          if (timeA === 0 || timeB === 0) return 0;
          return timeA - timeB;
        }
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
      <StockHeader
        stockCode={stockCode}
        stockName={stockName || stockCode} // stockName state 사용
        currentPrice={data.currentPrice}
        changeAmount={data.changeAmount}
        changeRate={data.changeRate}
        onBack={onBack}
        isLive={true}
      />

      {/* Tabs */}
      <div className="border-b border-[#232332] bg-[#0a0a0f]">
        <StockTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        {activeTab === "chart" && (
          <div className="rounded-2xl bg-[#1a1a24] p-4 shadow">
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
            <StockReports data={reports} />
          </div>
        )}
      </div>
    </div>
  );
}
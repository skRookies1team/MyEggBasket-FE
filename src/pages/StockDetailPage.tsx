import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StockHeader } from '../components/stock/StockHeader';
import { StockChart } from '../components/stock/StockChart';
import { StockOrderBook } from '../components/stock/StockOrderBook';
import { StockTabNav } from '../components/stock/StockTabNav';
import { StockNews } from '../components/stock/StockNews';
import { StockFinancials } from '../components/stock/StockFinancials';
import { StockReports } from '../components/stock/StockReports';

import type {
  StockDetailData,
  Period,
  TabType,
  StockPriceData,
  StockCurrentPrice,
} from '../types/stock';

import { useRealtimePrice } from '../hooks/useRealtimeStock';
import { fetchHistoricalData } from '../api/stocksApi';
import { fetchStockCurrentPrice } from '../api/liveStockApi';
import { subscribeRealtimePrice } from '../api/realtimeApi';

/* ------------------------------------------------------------------ */
/* 타입 유틸 */
/* ------------------------------------------------------------------ */
type HistoryPeriod = Exclude<Period, 'minute'>;
const isHistoryPeriod = (p: Period): p is HistoryPeriod => p !== 'minute';

/* ------------------------------------------------------------------ */
/* [Container] */
/* ------------------------------------------------------------------ */
export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const stockCode = code || '005930';

  /* -------------------------------
     탭 상태 (분봉 여부 판단의 기준)
  -------------------------------- */
  const [period, setPeriod] = useState<Period>('day');

  /* -------------------------------
     ✅ 분봉일 때만 STOMP 연결
  -------------------------------- */
  const realtimeData = useRealtimePrice(
    stockCode,
    period === 'minute'
  );

  /* -------------------------------
     종목명 헬퍼
  -------------------------------- */
  const getStockName = (code: string) => {
    const map: Record<string, string> = {
      '005930': '삼성전자',
      '000660': 'SK하이닉스',
      '035420': 'NAVER',
      '005380': '현대차',
      '051910': 'LG화학',
    };
    return map[code] || `종목(${code})`;
  };

  /* -------------------------------
     ✅ 분봉 진입 시 REST 구독 (1회)
  -------------------------------- */
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (period !== 'minute') {
      subscribedRef.current = false; // 분봉 나가면 초기화
      return;
    }

    if (subscribedRef.current) return;

    subscribedRef.current = true;
    subscribeRealtimePrice(stockCode).catch(console.error);

  }, [period, stockCode]);

  /* -------------------------------
     REST 현재가 (fallback)
  -------------------------------- */
  const [restInfo, setRestInfo] = useState<StockCurrentPrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const info = await fetchStockCurrentPrice(stockCode);
        if (mounted && info) setRestInfo(info);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [stockCode]);

  /* -------------------------------
     실시간 > REST > 기본값
  -------------------------------- */
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
      orderBook: { sell: [], buy: [] },
      news: [],
      financials: { revenue: [], profit: [] },
      reports: [],
    }),
    [realtimeData, restInfo],
  );

  return (
    <StockDetailView
      stockName={getStockName(stockCode)}
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
  stockName,
  stockCode,
  data,
  period,
  onPeriodChange,
  onBack,
  isLoading = false,
}: {
  stockName: string;
  stockCode: string;
  data: StockDetailData | null;
  period: Period;
  onPeriodChange: (p: Period) => void;
  onBack: () => void;
  isLoading?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('chart');

  const [historicalData, setHistoricalData] = useState<StockPriceData[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  /* -------------------------------
     day / week / month / year 만 REST
  -------------------------------- */
  useEffect(() => {
    if (!isHistoryPeriod(period)) return;

    let mounted = true;

    const loadHistory = async () => {
      setIsChartLoading(true);
      try {
        const result = await fetchHistoricalData(stockCode, period);
        if (mounted) setHistoricalData(result);
      } finally {
        if (mounted) setIsChartLoading(false);
      }
    };

    loadHistory();
    return () => {
      mounted = false;
    };
  }, [period, stockCode]);

  const displayChartData = useMemo(() => {
    if (!isHistoryPeriod(period)) return [];

    return [...historicalData].sort(
      (a, b) =>
        new Date(a.time).getTime() -
        new Date(b.time).getTime(),
    );
  }, [period, historicalData]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-20">
      <StockHeader
        stockName={stockName}
        currentPrice={data.currentPrice}
        changeAmount={data.changeAmount}
        changeRate={data.changeRate}
        period={period}
        onPeriodChange={onPeriodChange}
        onBack={onBack}
        isLive={period === 'minute'}
        acmlVol={0}
      />

      <StockTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="max-w-[1600px] mx-auto p-6">
        {activeTab === 'chart' && (
          <StockChart data={displayChartData} period={period} />
        )}

        {activeTab === 'order' && (
          <StockOrderBook
            stockCode={stockCode}
            orderBook={data.orderBook}
            currentPrice={data.currentPrice}
          />
        )}

        {activeTab === 'news' && (
          <StockNews data={data.news} query={stockName} />
        )}

        {activeTab === 'info' && (
          <StockFinancials data={data.financials} />
        )}

        {activeTab === 'report' && (
          <StockReports data={data.reports} />
        )}
      </div>
    </div>
  );
}

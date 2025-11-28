import { useState, useMemo, useEffect, useRef, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StockHeader } from '../components/stock/StockHeader';
import { StockChart } from '../components/stock/StockChart';
import { StockOrderBook } from '../components/stock/StockOrderBook';
import { StockIndicators } from '../components/stock/StockIndicators';
import { StockTabNav } from '../components/stock/StockTabNav';
import { StockNews } from '../components/stock/StockNews';
import { StockFinancials } from '../components/stock/StockFinancials';
import { StockReports } from '../components/stock/StockReports';
import { FINANCIAL_SERVICE_KEY } from '../config/api';

// ★ API 및 훅 import
import {
    fetchHistoricalData,
    getAccessToken,
    fetchCurrentPrice,
} from '../api/stockApi';
import { useRealtimeStock } from '../hooks/useRealtimeStock'; // 실시간 훅 추가

import type { StockDetailData, Period, TabType, StockPriceData, FinancialData, CurrentPriceResult } from '../types/stock';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
type RealtimePoint = { price: number; volume?: number; time?: string } | undefined;
type RealtimeInfo = { askp1?: number; bidp1?: number; acml_vol?: number; time?: string; stck_prpr?: number; prdy_vrss?: number; prdy_ctrt?: number; } | undefined;

interface StockDetailViewProps {
    stockName: string;
    stockCode: string; // 종목 코드 추가
    data: StockDetailData | null;
    onBack: () => void;
    isLoading?: boolean;
    realtimePoint?: RealtimePoint;
    realtimeInfo?: RealtimeInfo;
}

// --------------------------------------------------------------------------
// [Container] 데이터 로딩 및 상태 관리 (진입점)
// --------------------------------------------------------------------------
export default function StockDetailPage() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();

    // URL에 코드가 없으면 기본값(삼성전자) 사용 (혹은 에러 처리)
    const stockCode = code || "005930";

    // 간단한 종목명 매핑 헬퍼 (실제 서비스에서는 종목 마스터 API 필요)
    const getStockName = (code: string) => {
        const map: Record<string, string> = {
            "005930": "삼성전자",
            "000660": "SK하이닉스",
            "035420": "NAVER",
            "005380": "현대차",
            "051910": "LG화학"
        };
        return map[code] || `종목(${code})`;
    };

    // 1. 훅을 통해 해당 종목(stockCode)의 실시간 데이터 구독
    const { realtimeData, loading } = useRealtimeStock(stockCode);

    // 2. 뉴스 데이터 (예시용 고정값 유지, 필요시 API 호출로 변경 가능)
    const newsRef = useRef([]);

    // 3. 데이터 조합 (Routes.tsx에 있던 로직 이동)
    const combinedData: StockDetailData = useMemo(() => ({
        currentPrice: realtimeData.currentPrice,
        changeAmount: realtimeData.changeAmount,
        changeRate: realtimeData.changeRate,
        chartData: [],
        orderBook: { sell: [], buy: [] },
        news: newsRef.current,
        financials: { revenue: [], profit: [] },
        reports: [],
    }), [realtimeData.currentPrice, realtimeData.changeAmount, realtimeData.changeRate]);

    const hasRealtime = realtimeData && realtimeData.currentPrice !== 0;

    // 실시간 포인트 (분봉 차트 업데이트용)
    const realtimePoint = hasRealtime
        ? {
            price: realtimeData.currentPrice,
            volume: realtimeData.acml_vol ?? 0,
            time: new Date().toISOString(),
        }
        : undefined;

    // 실시간 헤더 정보 (호가, 누적거래량 등)
    const realtimeInfo = hasRealtime
        ? {
            askp1: realtimeData.askp1,
            bidp1: realtimeData.bidp1,
            acml_vol: realtimeData.acml_vol,
            time: new Date().toISOString(),
            stck_prpr: realtimeData.stck_prpr,
            prdy_vrss: realtimeData.prdy_vrss,
            prdy_ctrt: realtimeData.prdy_ctrt,
        }
        : undefined;

    return (
        <StockDetailView
            stockName={getStockName(stockCode)}
            stockCode={stockCode}
            data={combinedData}
            onBack={() => navigate(-1)}
            isLoading={loading}
            realtimePoint={realtimePoint}
            realtimeInfo={realtimeInfo}
        />
    );
}

// --------------------------------------------------------------------------
// [View] 실제 UI 렌더링 (기존 StockDetailPage 로직)
// --------------------------------------------------------------------------
function StockDetailView({
                             stockName,
                             stockCode,
                             data,
                             onBack,
                             isLoading = false,
                             realtimePoint,
                             realtimeInfo
                         }: StockDetailViewProps) {

    const [period, setPeriod] = useState<Period>('day');
    const [activeTab, setActiveTab] = useState<TabType>('chart');

    // 분봉 설정
    const [minuteWindow, setMinuteWindow] = useState<number>(120);
    const [volatility, setVolatility] = useState<'low'|'normal'|'high'>('normal');

    // 재무제표 상태
    const [corpRegNo, setCorpRegNo] = useState<string>('');
    const [financials, setFinancials] = useState<FinancialData>(data?.financials ?? { revenue: [], profit: [] });
    const [finLoading, setFinLoading] = useState<boolean>(false);
    const [finError, setFinError] = useState<string | null>(null);

    // 기간별 차트 데이터 상태
    const [historicalData, setHistoricalData] = useState<StockPriceData[]>([]);
    const [isChartLoading, setIsChartLoading] = useState<boolean>(false);

    // REST API 현재가 정보
    const [restInfo, setRestInfo] = useState<CurrentPriceResult | null>(null);

    // --------------------------------------------------------------------------
    // 분봉 전용 로직 (Websocket + LocalStorage)
    // --------------------------------------------------------------------------
    // 종목 코드별로 로컬스토리지 키 분리
    const STORAGE_KEY = `live_chart_points_${stockCode}`;
    const collectedRef = useRef<StockPriceData[]>([]);
    const [collectedVersion, setCollectedVersion] = useState(0);

    const normalizeTimeLabel = (raw?: string) => {
        if (!raw) return '';
        const s = raw.trim();
        const hhmmMatch = s.match(/(\d{1,2}):(\d{2})/);
        if (hhmmMatch) {
            const hour = Number(hhmmMatch[1]);
            const minute = hhmmMatch[2];
            const hh = String(hour).padStart(2, '0');
            return `${hh}:${minute}`;
        }
        return s.slice(0, 5);
    };

    // 초기 로드: localStorage에서 기존 수집 데이터 로드
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as StockPriceData[];
                collectedRef.current = Array.isArray(parsed)
                    ? parsed.map(p => ({ ...p, time: normalizeTimeLabel(p.time) })).slice(-minuteWindow)
                    : [];
                setCollectedVersion(v => v + 1);
            } else {
                collectedRef.current = []; // 키가 바뀌면 초기화
            }
        } catch {
            collectedRef.current = [];
        }
    }, [STORAGE_KEY, minuteWindow]); // STORAGE_KEY 변경 시 재실행

    // 실시간 포인트 수집
    useEffect(() => {
        if (!realtimePoint) return;
        const now = new Date(realtimePoint.time ?? Date.now());
        const minuteLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const last = collectedRef.current[collectedRef.current.length - 1];
        if (last && last.time === minuteLabel) {
            last.price = realtimePoint.price;
            last.volume = (last.volume || 0) + (realtimePoint.volume ?? 0);
        } else {
            collectedRef.current.push({ time: minuteLabel, price: realtimePoint.price, volume: realtimePoint.volume ?? 0 });
        }

        if (collectedRef.current.length > minuteWindow) {
            collectedRef.current = collectedRef.current.slice(collectedRef.current.length - minuteWindow);
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(collectedRef.current));
        } catch {
            // ignore
        }
        setCollectedVersion(v => v + 1);
    }, [realtimePoint, minuteWindow, STORAGE_KEY]);


    // --------------------------------------------------------------------------
    // 기간별(일/주/월/년) 차트 데이터 로드
    // --------------------------------------------------------------------------
    useEffect(() => {
        if (period === 'minute') return;

        let isMounted = true;
        const loadHistory = async () => {
            setIsChartLoading(true);
            try {
                const token = await getAccessToken();
                if (!token || !isMounted) return;

                const result = await fetchHistoricalData(stockCode, period, token);
                if (isMounted) {
                    setHistoricalData(result);
                }
            } catch (err) {
                console.error("차트 데이터 로드 실패", err);
            } finally {
                if (isMounted) setIsChartLoading(false);
            }
        };

        loadHistory();
        return () => { isMounted = false; };
    }, [period, stockCode]); // stockCode 변경 시 재조회

    // --------------------------------------------------------------------------
    // 초기 REST API 현재가/누적거래량 로드
    // --------------------------------------------------------------------------
    useEffect(() => {
        let isMounted = true;
        const loadCurrentInfo = async () => {
            const token = await getAccessToken();
            if (!token) return;

            // *주의*: fetchCurrentPrice도 stockCode 인자 필요 (현재는 상수 사용 중)
            const info = await fetchCurrentPrice(token, stockCode);
            if (isMounted && info) {
                setRestInfo(info);
            }
        };

        loadCurrentInfo();
        return () => { isMounted = false; };
    }, [stockCode]);


    // --------------------------------------------------------------------------
    // 차트 데이터 선택 (분봉 vs API 데이터)
    // --------------------------------------------------------------------------
    const displayChartData = useMemo(() => {
        if (period === 'minute') {
            const baseData = collectedRef.current.slice();
            if (realtimePoint) {
                const now = new Date(realtimePoint.time ?? Date.now());
                const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                const lastIdx = baseData.length - 1;
                const lastItem = baseData[lastIdx];

                if (lastItem && lastItem.time === timeLabel) {
                    baseData[lastIdx] = {
                        ...lastItem,
                        price: realtimePoint.price,
                        volume: (lastItem.volume || 0)
                    };
                } else {
                    baseData.push({
                        time: timeLabel,
                        price: realtimePoint.price,
                        volume: realtimePoint.volume ?? 0
                    });
                }
            }
            return baseData.length > minuteWindow ? baseData.slice(baseData.length - minuteWindow) : baseData;
        }

        if (historicalData.length > 0) {
            return historicalData;
        }

        return data?.chartData ?? [];

    }, [period, data, collectedVersion, realtimePoint, minuteWindow, historicalData]);

    const fixedDomainRef = useRef<[number, number] | null>([80000, 100000]); // 종목별로 달라져야 할 수 있음

    if (isLoading || !data) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // 재무제표 함수
    const fetchFinancials = async (corpRegNo: string, yearsCount: number = 5) => {
        if (!FINANCIAL_SERVICE_KEY) {
            setFinError('FINANCIAL_SERVICE_KEY가 설정되어 있지 않습니다.');
            return;
        }
        if (!corpRegNo) {
            setFinError('법인등록번호를 입력하세요.');
            return;
        }

        setFinLoading(true);
        setFinError(null);

        const decodedServiceKey = decodeURIComponent(FINANCIAL_SERVICE_KEY);
        const safeParseNumber = (val: any) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const cleaned = val.replace(/,/g, '').trim();
                const num = Number(cleaned);
                return Number.isFinite(num) ? num : 0;
            }
            return 0;
        };

        try {
            const currentYear = new Date().getFullYear();
            const yearsToFetch = Array.from({ length: yearsCount }, (_, i) => String(currentYear - i));
            const results: FinancialData = {
                revenue: [], profit: [], capital: [], netProfit: [],
                totalAssets: [], equity: [], totalDebt: [], debtRatio: [], comprehensiveIncome: [],
            };
            let successCount = 0;

            for (const bizYear of yearsToFetch) {
                const API_URL = 'http://apis.data.go.kr/1160100/service/GetFinaStatInfoService_V2/getSummFinaStat_V2';
                const params = new URLSearchParams({
                    serviceKey: decodedServiceKey,
                    bizYear: bizYear,
                    crno: corpRegNo,
                    numOfRows: '1',
                    pageNo: '1',
                    resultType: 'json',
                });

                const resp = await fetch(`${API_URL}?${params.toString()}`);
                if (!resp.ok) continue;

                const json = await resp.json();
                const item = json?.response?.body?.items?.item;

                if (item && item.length > 0) {
                    const f = item[0];
                    results.revenue.push({ year: bizYear, value: safeParseNumber(f.enpSaleAmt) });
                    results.profit.push({ year: bizYear, value: safeParseNumber(f.enpBzopPft) });
                    successCount++;
                }
            }

            if (successCount === 0) setFinError('조회된 재무제표 데이터가 없습니다.');

            const sortByYearDesc = (a: { year: string }, b: { year: string }) => b.year.localeCompare(a.year);
            results.revenue.sort(sortByYearDesc);
            results.profit.sort(sortByYearDesc);
            setFinancials(results);

        } catch (err: any) {
            setFinError(err?.message || '재무제표 조회 오류');
        } finally {
            setFinLoading(false);
        }
    };

    // 데이터 결정
    const displayPrice = realtimeInfo?.stck_prpr ?? restInfo?.stck_prpr ?? data.currentPrice;
    const displayChange = realtimeInfo?.prdy_vrss ?? restInfo?.prdy_vrss ?? data.changeAmount;
    const displayRate = realtimeInfo?.prdy_ctrt ?? restInfo?.prdy_ctrt ?? data.changeRate;
    const displayVol = realtimeInfo?.acml_vol ?? restInfo?.acml_vol ?? 0;

    return (
        <div className="min-h-screen bg-[#fef7ff] pb-20">
            <StockHeader
                stockName={stockName}
                currentPrice={displayPrice}
                changeAmount={displayChange}
                changeRate={displayRate}
                period={period}
                onPeriodChange={setPeriod}
                onBack={onBack}
                isLive={!!realtimeInfo}
                lastUpdate={realtimeInfo?.time}
                askp1={realtimeInfo?.askp1}
                bidp1={realtimeInfo?.bidp1}
                acmlVol={displayVol}
            />

            {period === 'minute' && (
                <div className="max-w-[1600px] mx-auto p-4 flex items-center gap-4">
                    <label className="text-sm text-[#49454f]">분봉 포인트</label>
                    <select value={minuteWindow} onChange={(e) => setMinuteWindow(Number(e.target.value))} className="px-3 py-2 border rounded">
                        <option value={30}>30</option>
                        <option value={60}>60</option>
                        <option value={120}>120</option>
                        <option value={240}>240</option>
                    </select>

                    <label className="text-sm text-[#49454f]">변동성</label>
                    <select value={volatility} onChange={(e: ChangeEvent<HTMLSelectElement>) => setVolatility(e.target.value as any)} className="px-3 py-2 border rounded">
                        <option value="low">낮음</option>
                        <option value="normal">보통</option>
                        <option value="high">높음</option>
                    </select>
                </div>
            )}

            <StockTabNav activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="max-w-[1600px] mx-auto p-6">
                {activeTab === 'chart' && (
                    <div className="relative">
                        {isChartLoading && (
                            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                                <div className="text-[#4f378a] font-semibold">데이터 불러오는 중...</div>
                            </div>
                        )}
                        <StockChart
                            data={displayChartData}
                            period={period}
                            fixedDomain={period === 'minute' ? fixedDomainRef.current ?? undefined : undefined}
                        />
                    </div>
                )}

                {activeTab === 'order' && (
                    <StockOrderBook
                        stockCode={stockCode}
                        orderBook={data.orderBook}
                        currentPrice={displayPrice}
                    />
                )}

                {activeTab === 'news' && <StockNews data={data.news} query={stockName.split(' ')[0]} />}

                {activeTab === 'info' && (
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <input value={corpRegNo} onChange={(e) => setCorpRegNo(e.target.value)} placeholder="법인등록번호" className="px-3 py-2 border rounded w-64" />
                            <button
                                onClick={() => fetchFinancials(corpRegNo, 5)}
                                className="px-4 py-2 bg-[#4f378a] text-white rounded"
                            >
                                재무제표 불러오기
                            </button>
                            {finLoading && <span>로딩중...</span>}
                            {finError && <span className="text-red-500 text-sm">{finError}</span>}
                        </div>
                        <StockFinancials data={financials} />
                    </div>
                )}

                {activeTab === 'indicators' && <StockIndicators />}

                {activeTab === 'report' && <StockReports data={data.reports} />}
            </div>
        </div>
    );
}
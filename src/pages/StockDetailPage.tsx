import { useState, useMemo, useEffect, useRef, type ChangeEvent } from 'react';
import { StockHeader } from '../components/stock/StockHeader';
import { StockChart } from '../components/stock/StockChart';
import { StockOrderBook } from '../components/stock/StockOrderBook';
import { StockIndicators } from '../components/stock/StockIndicators';
import { StockTabNav } from '../components/stock/StockTabNav';
import { StockNews } from '../components/stock/StockNews';
import { StockFinancials } from '../components/stock/StockFinancials';
import { StockReports } from '../components/stock/StockReports';
// Step 2-1: FINANCIAL_SERVICE_KEY 임포트
import { FINANCIAL_SERVICE_KEY } from '../config/api';

type RealtimePoint = { price: number; volume?: number; time?: string } | undefined;
import type { StockDetailData, Period, TabType, StockPriceData, FinancialData } from '../types/stock';

type RealtimeInfo = { askp1?: number; bidp1?: number; acml_vol?: number; time?: string } | undefined;

// --- 메인 페이지 컴포넌트 ---

interface StockDetailPageProps {
    stockName: string;
    data: StockDetailData | null; // 데이터 로딩 전에는 null일 수 있음
    onBack: () => void;
    isLoading?: boolean;
}

export function StockDetailPage({ stockName, data, onBack, isLoading = false, realtimePoint, realtimeInfo }: StockDetailPageProps & { realtimePoint?: RealtimePoint; realtimeInfo?: RealtimeInfo }) {
    const [period, setPeriod] = useState<Period>('day');
    const [activeTab, setActiveTab] = useState<TabType>('chart');
    // 분봉 설정: 창 길이(포인트 수)와 변동성(multiplier)
    const [minuteWindow, setMinuteWindow] = useState<number>(120);
    const [volatility, setVolatility] = useState<'low'|'normal'|'high'>('normal');
    // 재무제표 상태: props에서 초기값을 사용하고, 사용자 입력으로 서버에서 불러올 수 있음
    const [corpRegNo, setCorpRegNo] = useState<string>('');
    const [financials, setFinancials] = useState<FinancialData>(data?.financials ?? { revenue: [], profit: [] });
    const [finLoading, setFinLoading] = useState<boolean>(false);
    const [finError, setFinError] = useState<string | null>(null);

    // 분봉 데이터는 목데이터 사용하지 않고 로컬스토리지에 수집된 실시간 포인트를 사용합니다.
    const STORAGE_KEY = 'live_chart_points_005930';
    const collectedRef = useRef<StockPriceData[]>([]);
    const [collectedVersion, setCollectedVersion] = useState(0);

    // helper: 다양한 시간 레이블(예: "오후 02:30", "2:30 PM", "14:30", "오후 02")를 안정적으로 "HH:mm"(24h)로 정규화
    const normalizeTimeLabel = (raw?: string) => {
        if (!raw) return '';
        const s = raw.trim();

        // 이미 24시간 형식일 가능성: "14:30" 혹은 "14:30:00"
        const hhmmMatch = s.match(/(\d{1,2}):(\d{2})/);
        if (hhmmMatch) {
            const hour = Number(hhmmMatch[1]);
            const minute = hhmmMatch[2];
            const hh = String(hour).padStart(2, '0');
            return `${hh}:${minute}`;
        }

        // 한국어 AM/PM 형식: "오전 2:30", "오후 2" 등
        const korMatch = s.match(/(오전|오후)\s*(\d{1,2})(?::(\d{2}))?/i);
        if (korMatch) {
            let hour = Number(korMatch[2]);
            const minute = korMatch[3] ?? '00';
            const ampm = korMatch[1];
            if (/오후/i.test(ampm) && hour < 12) hour += 12;
            if (/오전/i.test(ampm) && hour === 12) hour = 0;
            const hh = String(hour).padStart(2, '0');
            return `${hh}:${minute}`;
        }

        // 영어 AM/PM 형식: "2:30 PM", "2 PM"
        const enMatch = s.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
        if (enMatch) {
            let hour = Number(enMatch[1]);
            const minute = enMatch[2] ?? '00';
            const ampm = enMatch[3];
            if (/PM/i.test(ampm) && hour < 12) hour += 12;
            if (/AM/i.test(ampm) && hour === 12) hour = 0;
            const hh = String(hour).padStart(2, '0');
            return `${hh}:${minute}`;
        }

        // 숫자만 있는 경우(예: "14" 또는 "2") -> 분은 :00으로 처리
        const justHour = s.match(/^\d{1,2}$/);
        if (justHour) {
            const hh = String(Number(s)).padStart(2, '0');
            return `${hh}:00`;
        }

        // 숫자가 포함되어 있으면 가능한 값으로 추출
        const numMatch = s.match(/(\d{1,2})(?::(\d{2}))?/);
        if (numMatch) {
            const hour = Number(numMatch[1]);
            const minute = numMatch[2] ?? '00';
            const hh = String(hour).padStart(2, '0');
            return `${hh}:${minute}`;
        }

        // fallback: 원본의 앞 5문자(가능하면 HH:mm)
        return s.slice(0, 5);
    };

    // 초기 로드: localStorage에서 기존 수집 데이터 로드 (분단위 레이블)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as StockPriceData[];
                // ensure time labels are minute-granular (HH:mm) - 기존 AM/PM 문자열도 변환
                collectedRef.current = Array.isArray(parsed)
                    ? parsed.map(p => ({ ...p, time: normalizeTimeLabel(p.time) })).slice(-minuteWindow)
                    : [];
                setCollectedVersion(v => v + 1);
            }
        } catch {
            collectedRef.current = [];
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // displayChartData: minute면 local storage 기반, 아니면 서버에서 받은 data.chartData (비어있음)
    // collectedVersion은 로컬 저장소 업데이트를 트리거하기 위해 사용되므로 eslint 경고를 비활성화합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const displayChartData = useMemo(() => {
        if (!data) return [] as StockPriceData[];
        if (period === 'minute') {
            return collectedRef.current.slice();
        }
        return data.chartData;
    }, [period, data, collectedVersion]);

    // 실시간 포인트가 들어오면 마지막 포인트를 교체 또는 추가하여 실시간 반영
    const liveChartData = useMemo(() => {
        if (!displayChartData || displayChartData.length === 0) return displayChartData;
        if (!realtimePoint) return displayChartData;

        const copied = displayChartData.slice();
        const now = new Date(realtimePoint.time ?? Date.now());
        // 24시간 형식 HH:mm 로 표기
        const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const lastIdx = copied.length - 1;
        const lastItem = copied[lastIdx];
        if (!lastItem || lastItem.time !== timeLabel) {
            // push new point
            copied.push({ time: timeLabel, price: realtimePoint.price, volume: realtimePoint.volume ?? (lastItem?.volume ?? 0) });
        } else {
            // replace last
            copied[lastIdx] = { time: timeLabel, price: realtimePoint.price, volume: realtimePoint.volume ?? lastItem.volume };
        }
        // enforce sliding window if minuteWindow applies
        if (period === 'minute' && copied.length > minuteWindow) {
            return copied.slice(copied.length - minuteWindow);
        }
        return copied;
    }, [displayChartData, realtimePoint, period, minuteWindow]);

    // collectedLivePoints: realtimePoint가 들어오면 localStorage에 저장하고 버전 증가시켜 렌더링을 트리거
    useEffect(() => {
        if (!realtimePoint) return;
        const now = new Date(realtimePoint.time ?? Date.now());
        // minute granularity label "HH:mm" (24h)
        const minuteLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const last = collectedRef.current[collectedRef.current.length - 1];
        if (last && last.time === minuteLabel) {
            // update last point (replace price/accumulate volume)
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
            // ignore storage errors
        }
        setCollectedVersion(v => v + 1);
    }, [realtimePoint, minuteWindow]);

    // fixedDomainRef: 요구대로 Y축 고정(최소 80000 최대 100000)
    const fixedDomainRef = useRef<[number, number] | null>([80000, 100000]);

    // 데이터 로딩 상태 처리
    if (isLoading || !data) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // Step 2-2: 재무제표 불러오기 함수 정의 (공공데이터포털 API 연동)
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
                revenue: [],
                profit: [],
                capital: [],
                netProfit: [],
                totalAssets: [],
                equity: [],
                totalDebt: [],
                debtRatio: [],
                comprehensiveIncome: [],
            };
            let successCount = 0;

            for (const bizYear of yearsToFetch) {
                const API_URL = 'http://apis.data.go.kr/1160100/service/GetFinaStatInfoService_V2/getSummFinaStat_V2';
                const params = new URLSearchParams({
                    serviceKey: decodedServiceKey,
                    bizYear: bizYear,
                    // 🔁 실제 API는 "crno"를 사용하므로 여기서 맞춰줍니다.
                    crno: corpRegNo,
                    numOfRows: '1',
                    pageNo: '1',
                    resultType: 'json',
                });

                const resp = await fetch(`${API_URL}?${params.toString()}`);

                if (!resp.ok) {
                    if (resp.status === 401) {
                        setFinError('API 키 오류: 서비스 키 인증에 실패했습니다 (401 Unauthorized). 환경변수 VITE_FINANCIAL_SERVICE_KEY를 확인하세요.');
                        throw new Error('401 Unauthorized');
                    }
                    console.warn(`[${bizYear}] 재무제표 조회 실패: HTTP 상태 ${resp.status}`);
                    continue;
                }

                const json = await resp.json();

                if (json.response?.header?.resultCode !== '00') {
                    console.warn(`[${bizYear}] API 응답 오류:`, json.response?.header?.resultMsg);
                    continue;
                }

                // 실제 응답 구조 예시
                // json.response.body.items.item[0] = {
                //   basDt: '20250630',
                //   bizYear: '2025',
                //   crno: '1101110003345',
                //   enpSaleAmt: '1476972318390', // 매출액
                //   enpBzopPft: '74488038737',   // 영업이익
                //   enpCptlAmt: '...',           // 자본금
                //   enpCrtmNpf: '...',           // 당기순이익
                //   enpTastAmt: '...',           // 총자산
                //   enpTcptAmt: '...',           // 자기자본
                //   enpTdbtAmt: '...',           // 총부채
                //   fnclDebtRto: '...',          // 부채비율
                //   iclsPalClcAmt: '...',        // 포괄손익
                //   ...생략
                // }
                const item = json?.response?.body?.items?.item;

                if (item && item.length > 0) {
                    const financialItem = item[0];

                    const revenueValue = safeParseNumber(financialItem.enpSaleAmt) || 0;
                    const profitValue = safeParseNumber(financialItem.enpBzopPft) || 0;
                    const capitalValue = safeParseNumber(financialItem.enpCptlAmt) || 0;
                    const netProfitValue = safeParseNumber(financialItem.enpCrtmNpf) || 0;
                    const totalAssetsValue = safeParseNumber(financialItem.enpTastAmt) || 0;
                    const equityValue = safeParseNumber(financialItem.enpTcptAmt) || 0;
                    const totalDebtValue = safeParseNumber(financialItem.enpTdbtAmt) || 0;
                    const debtRatioValue = safeParseNumber(financialItem.fnclDebtRto) || 0;
                    const comprehensiveIncomeValue = safeParseNumber(financialItem.iclsPalClcAmt) || 0;

                    results.revenue.push({ year: bizYear, value: revenueValue });
                    results.profit.push({ year: bizYear, value: profitValue });
                    results.capital.push({ year: bizYear, value: capitalValue });
                    results.netProfit.push({ year: bizYear, value: netProfitValue });
                    results.totalAssets.push({ year: bizYear, value: totalAssetsValue });
                    results.equity.push({ year: bizYear, value: equityValue });
                    results.totalDebt.push({ year: bizYear, value: totalDebtValue });
                    results.debtRatio.push({ year: bizYear, value: debtRatioValue });
                    results.comprehensiveIncome.push({ year: bizYear, value: comprehensiveIncomeValue });
                    successCount++;
                }
            }

            if (successCount === 0) {
                setFinError('조회된 재무제표 데이터가 없습니다. 법인등록번호(crno)를 확인하세요.');
            }

            const sortByYearDesc = (a: { year: string }, b: { year: string }) => b.year.localeCompare(a.year);

            results.revenue.sort(sortByYearDesc);
            results.profit.sort(sortByYearDesc);
            results.capital.sort(sortByYearDesc);
            results.netProfit.sort(sortByYearDesc);
            results.totalAssets.sort(sortByYearDesc);
            results.equity.sort(sortByYearDesc);
            results.totalDebt.sort(sortByYearDesc);
            results.debtRatio.sort(sortByYearDesc);
            results.comprehensiveIncome.sort(sortByYearDesc);

            setFinancials(results);
        } catch (err: any) {
            console.error('재무제표 조회 오류:', err);
            if (err.message !== '401 Unauthorized') {
                setFinError(err?.message || '재무제표 조회 오류가 발생했습니다.');
            }
        } finally {
            setFinLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fef7ff] pb-20">
            <StockHeader
                stockName={stockName}
                currentPrice={data.currentPrice}
                changeAmount={data.changeAmount}
                changeRate={data.changeRate}
                period={period}
                onPeriodChange={setPeriod}
                onBack={onBack}
                isLive={!!realtimeInfo}
                lastUpdate={realtimeInfo?.time}
                askp1={realtimeInfo?.askp1}
                bidp1={realtimeInfo?.bidp1}
                acmlVol={realtimeInfo?.acml_vol}
            />

            {/* 분봉 설정 UI: 분봉 선택 시에만 표시 */}
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
                    <select value={volatility} onChange={(e: ChangeEvent<HTMLSelectElement>) => setVolatility(e.target.value as 'low'|'normal'|'high')} className="px-3 py-2 border rounded">
                        <option value="low">낮음</option>
                        <option value="normal">보통</option>
                        <option value="high">높음</option>
                    </select>
                </div>
            )}

            <StockTabNav activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="max-w-[1600px] mx-auto p-6">
                {activeTab === 'chart' && <StockChart data={liveChartData} period={period} fixedDomain={fixedDomainRef.current ?? undefined} />}

                {activeTab === 'order' && (
                    <StockOrderBook orderBook={data.orderBook} currentPrice={data.currentPrice} />
                )}

                {activeTab === 'news' && <StockNews data={data.news} query={"삼성전자"} />}

                {activeTab === 'info' && (
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <input value={corpRegNo} onChange={(e) => setCorpRegNo(e.target.value)} placeholder="법인등록번호(corp_reg_no) 입력" className="px-3 py-2 border rounded w-64" />
                            <button type="button" onClick={() => setCorpRegNo('1234567890')} title="예시값 채우기" className="px-3 py-2 border rounded bg-gray-100 text-sm">예시값 채우기</button>
                            <button type="button" onClick={() => {
                                // 샘플 데이터 즉시 표시 (API 없이 UI 테스트용)
                                const now = new Date().getFullYear();
                                setFinancials({
                                    revenue: [
                                        { year: String(now), value: 123456789 },
                                        { year: String(now - 1), value: 110234567 },
                                        { year: String(now - 2), value: 98012345 },
                                    ],
                                    profit: [
                                        { year: String(now), value: 12345678 },
                                        { year: String(now - 1), value: 10234567 },
                                        { year: String(now - 2), value: 9012345 },
                                    ],
                                });
                            }} title="샘플 데이터로 보기" className="px-3 py-2 border rounded bg-gray-100 text-sm">샘플 데이터로 보기</button>

                            <button
                                onClick={() => fetchFinancials(corpRegNo, 5)} // 새 함수 호출
                                className="px-4 py-2 bg-[#4f378a] text-white rounded"
                            >
                                재무제표 불러오기
                            </button>
                            {finLoading && <span className="text-sm text-[#666]">불러오는 중...</span>}
                            {finError && <span className="text-sm text-red-500">{finError}</span>}
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

export default StockDetailPage;


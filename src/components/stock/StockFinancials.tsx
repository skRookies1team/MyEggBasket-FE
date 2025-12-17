/* StockFinancials.tsx 전체 적용 예시 */
import { useState, useEffect } from 'react';
import { fetchFinancialMetrics, REPRT_CODES, type QuarterType } from '../../api/financialDataApi.ts';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export function StockFinancials({ stockCode }: { stockCode: string }) {
    const [year, setYear] = useState("2024");
    const [quarter, setQuarter] = useState<QuarterType>('4Q'); 
    const [realFinancials, setRealFinancials] = useState<any>(null);
    const [yearlyData, setYearlyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isYearlyLoading, setIsYearlyLoading] = useState(false);

    const years = Array.from({ length: 2025 - 2015 + 1 }, (_, i) => (2025 - i).toString());

    const quarters: { label: string, value: QuarterType }[] = [
        { label: '1분기', value: '1Q' },
        { label: '2분기', value: '2Q' },
        { label: '3분기', value: '3Q' },
        { label: '결산(연간)', value: '4Q' },
    ];

    // 상세 지표 로딩
    useEffect(() => {
        const loadDetail = async () => {
            setLoading(true);
            const codeValue = typeof stockCode === 'object' ? (stockCode as any).stockCode : stockCode;
            const result = await fetchFinancialMetrics(codeValue, year, REPRT_CODES[quarter]);
            setRealFinancials(result);
            setLoading(false);
        };
        loadDetail();
    }, [stockCode, year, quarter]);

    // 연간 데이터 로딩
    useEffect(() => {
        const loadYearlyTrend = async () => {
            setIsYearlyLoading(true);
            const codeValue = typeof stockCode === 'object' ? (stockCode as any).stockCode : stockCode;

            const promises = Object.entries(REPRT_CODES).map(async ([qKey, qCode]) => {
                const res = await fetchFinancialMetrics(codeValue, year, qCode);
                return {
                    name: qKey === '4Q' ? '결산(연간)' : qKey,
                    revenue: res?.revenue || 0,
                    profit: res?.profit || 0,
                    netProfit: res?.netProfit || 0,
                    liabilities: res?.totalLiabilities || 0,
                    equity: res?.totalEquity || 0,
                };
            });

            const results = await Promise.all(promises);
            setYearlyData(results);
            setIsYearlyLoading(false);
        };
        loadYearlyTrend();
    }, [stockCode, year]);

    // 금액 포맷 함수 (조/억 단위)
    const formatMoney = (v?: number) => {
        if (!v || isNaN(v) || v === 0) return '-';
        const trillion = 1_0000_0000_0000;
        const hundredMillion = 1_0000_0000;
        if (Math.abs(v) >= trillion) return `${(v / trillion).toFixed(1)}조원`;
        if (Math.abs(v) >= hundredMillion) return `${(v / hundredMillion).toFixed(1)}억원`;
        return `${v.toLocaleString()}원`;
    };

    // 차트 Y축 포맷터 (조 단위 적용)
    const chartFormatter = (value: number) => {
        const trillion = 1_0000_0000_0000;
        const hundredMillion = 1_0000_0000;
        if (Math.abs(value) >= trillion) return `${(value / trillion).toFixed(1)}조`;
        if (Math.abs(value) >= hundredMillion) return `${(value / hundredMillion).toFixed(0)}억`;
        return value.toString();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6 shadow-sm">
                {/* 상단 컨트롤러 (연도/분기 선택) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[#1e1e1e] font-bold text-lg">{year}년 재무 정보</h3>
                        <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded-md px-2 py-1 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-500">
                            {years.map(y => <option key={y} value={y}>{y}년</option>)}
                        </select>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {quarters.map((q) => (
                            <button key={q.value} onClick={() => setQuarter(q.value)}
                                className={`px-4 py-1.5 text-sm rounded-md transition-all ${quarter === q.value ? "bg-white text-blue-600 shadow-sm font-bold" : "text-gray-500 hover:text-gray-700"}`}>
                                {q.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 상세 지표 섹션: 두 줄 그리드 */}
                {loading ? (
                    <div className="py-10 text-center text-gray-400">데이터 로딩 중...</div>
                ) : (!realFinancials || realFinancials.status !== '000') ? (
                    <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 mb-6">
                        <p className="text-gray-500">{year}년 {quarter === '4Q' ? '결산' : quarter} 보고서가 아직 업로드 되지 않았습니다.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mb-8">
                        {/* 상단: 수익성 지표 (매출, 영업이익, 당기순이익) */}
                        <div className="grid grid-cols-3 gap-4 p-5 bg-blue-50/40 rounded-xl border border-blue-100">
                            <MetricBox title="매출액" value={formatMoney(realFinancials?.revenue)} color="#1e1e1e" />
                            <MetricBox title="영업이익" value={formatMoney(realFinancials?.profit)} color="#00b050" />
                            <MetricBox title="당기순이익" value={formatMoney(realFinancials?.netProfit)} color="#3b82f6" />
                        </div>
                        {/* 하단: 재무 건전성 지표 (부채총계, 자본총계, 부채비율) */}
                        <div className="grid grid-cols-3 gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                            <MetricBox title="부채총계" value={formatMoney(realFinancials?.totalLiabilities)} color="#ef4444" />
                            <MetricBox title="자본총계" value={formatMoney(realFinancials?.totalEquity)} color="#6366f1" />
                            <MetricBox title="부채비율" value={realFinancials?.debtRatio ? `${realFinancials.debtRatio.toFixed(2)}%` : '-'} color="#ef4444" />
                        </div>
                    </div>
                )}

                {/* 차트 섹션: 부채/자본 포함 */}
                <div className="mt-8">
                    <div className="flex justify-between items-end mb-4">
                        <h4 className="text-[#1e1e1e] font-bold text-md border-l-4 border-blue-500 pl-2">분기별 재무 추이</h4>
                        <span className="text-[11px] text-gray-400">* 결산(연간)은 누적 데이터입니다.</span>
                    </div>
                    <div className="h-[400px] w-full">
                        {isYearlyLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400">차트 준비 중...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis tickFormatter={chartFormatter} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} width={60} />
                                    <Tooltip
                                        formatter={(value: number) => formatMoney(value)}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="revenue" name="매출액" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="profit" name="영업이익" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="netProfit" name="순이익" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="liabilities" name="부채총계" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
                                    {/* <Bar dataKey="equity" name="자본총계" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={20} /> */}
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricBox({ title, value, color }: { title: string, value: string, color: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tight mb-1">{title}</span>
            <span className="font-extrabold text-base md:text-xl truncate" style={{ color }}>{value}</span>
        </div>
    );
}
import { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { FinancialData } from '../../types/stock';

interface StockFinancialsProps {
    data: FinancialData;
}

export function StockFinancials({ data }: StockFinancialsProps) {
    if (!data || (!data.revenue.length && !data.profit.length)) {
        return <div className="text-center p-10">재무제표 데이터가 없습니다.</div>;
    }

    // 모든 연도 목록(매출/이익 합집합) 추출 후 정렬
    const years = useMemo(() => {
        const set = new Set<string>();
        data.revenue.forEach(r => set.add(r.year));
        data.profit.forEach(p => set.add(p.year));
        return Array.from(set).sort(); // 오래된 연도 → 최신 연도
    }, [data]);

    const [selectedYear, setSelectedYear] = useState<string>(() => years[years.length - 1] ?? '');

    const selectedRevenue = useMemo(
        () => data.revenue.find(r => r.year === selectedYear),
        [data.revenue, selectedYear],
    );
    const selectedProfit = useMemo(
        () => data.profit.find(p => p.year === selectedYear),
        [data.profit, selectedYear],
    );
    const selectedCapital = useMemo(
        () => data.capital?.find(i => i.year === selectedYear),
        [data.capital, selectedYear],
    );
    const selectedNetProfit = useMemo(
        () => data.netProfit?.find(i => i.year === selectedYear),
        [data.netProfit, selectedYear],
    );
    const selectedTotalAssets = useMemo(
        () => data.totalAssets?.find(i => i.year === selectedYear),
        [data.totalAssets, selectedYear],
    );
    const selectedEquity = useMemo(
        () => data.equity?.find(i => i.year === selectedYear),
        [data.equity, selectedYear],
    );
    const selectedTotalDebt = useMemo(
        () => data.totalDebt?.find(i => i.year === selectedYear),
        [data.totalDebt, selectedYear],
    );
    const selectedDebtRatio = useMemo(
        () => data.debtRatio?.find(i => i.year === selectedYear),
        [data.debtRatio, selectedYear],
    );
    const selectedComprehensiveIncome = useMemo(
        () => data.comprehensiveIncome?.find(i => i.year === selectedYear),
        [data.comprehensiveIncome, selectedYear],
    );

    const formatMoney = (v?: number) => {
        if (v == null) return '-';
        // 원 단위 → 조/억 단위 간단 포맷 (예: 30.1조, 5.2억)
        const trillion = 1_0000_0000_0000; // 10^12
        const hundredMillion = 1_0000_0000; // 10^8
        if (Math.abs(v) >= trillion) {
            return `${(v / trillion).toFixed(1)}조원`;
        }
        if (Math.abs(v) >= hundredMillion) {
            return `${(v / hundredMillion).toFixed(1)}억원`;
        }
        return `${v.toLocaleString()}원`;
    };

    const formatPercent = (v?: number) => {
        if (v == null) return '-';
        return `${v.toFixed(2)}%`;
    };

    return (
        <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
            <h3 className="text-[#1e1e1e] mb-4">재무제표</h3>

            {/* 받은 데이터 JSON으로 표시 */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">수신된 데이터 (Raw JSON)</h4>
                <pre className="text-xs whitespace-pre-wrap break-all bg-white p-3 rounded">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>

            {/* 연도 탭 + 선택 연도 상세 요약 */}
            <div className="mb-6">
                <div className="mb-3 flex flex-wrap gap-2">
                    {years.map((year) => (
                        <button
                            key={year}
                            type="button"
                            onClick={() => setSelectedYear(year)}
                            className={`px-3 py-1 rounded-full border text-xs md:text-sm transition-colors ${
                                year === selectedYear
                                    ? 'bg-[#4f378a] text-white border-[#4f378a]'
                                    : 'bg-white text-[#49454f] border-[#d0d0d0] hover:bg-[#f3edf7]'
                            }`}
                        >
                            {year}년
                        </button>
                    ))}
                </div>

                <div className="border rounded-lg p-4 bg-[#f8f8f8] text-xs md:text-sm flex flex-col gap-1">
                    <div className="font-semibold mb-2">{selectedYear}년 재무 요약</div>
                    {/* 항목을 한 줄씩 div로 표시 */}
                    <div className="space-y-1">
                        <div>매출액: <span className="font-medium">{formatMoney(selectedRevenue?.value)}</span></div>
                        <div>영업이익: <span className="font-medium">{formatMoney(selectedProfit?.value)}</span></div>
                        <div>당기순이익: <span className="font-medium">{formatMoney(selectedNetProfit?.value)}</span></div>
                        <div>자본금: <span className="font-medium">{formatMoney(selectedCapital?.value)}</span></div>
                        <div>총자산: <span className="font-medium">{formatMoney(selectedTotalAssets?.value)}</span></div>
                        <div>자기자본: <span className="font-medium">{formatMoney(selectedEquity?.value)}</span></div>
                        <div>총부채: <span className="font-medium">{formatMoney(selectedTotalDebt?.value)}</span></div>
                        <div>부채비율: <span className="font-medium">{formatPercent(selectedDebtRatio?.value)}</span></div>
                        <div>포괄손익: <span className="font-medium">{formatMoney(selectedComprehensiveIncome?.value)}</span></div>
                    </div>
                </div>
            </div>

            {/* 전체 연도 추이 그래프 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-[#1e1e1e] mb-3">매출 추이</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.revenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(v) => formatMoney(v as number)} width={80} />
                                <Tooltip formatter={(v: any) => formatMoney(v as number)} />
                                <Bar dataKey="value" fill="#4f378a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div>
                    <h4 className="text-[#1e1e1e] mb-3">영업이익 추이</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.profit}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(v) => formatMoney(v as number)} width={80} />
                                <Tooltip formatter={(v: any) => formatMoney(v as number)} />
                                <Line type="monotone" dataKey="value" stroke="#00b050" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
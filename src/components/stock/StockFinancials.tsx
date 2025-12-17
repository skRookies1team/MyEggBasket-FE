import { useState, useEffect } from 'react';
import { fetchFinancialMetrics } from '../../api/financialDataApi.ts';

export function StockFinancials(stockCode:string) {
    const [realFinancials, setRealFinancials] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // stockCode가 객체라면 .stockCode를 붙여서 문자열 값만 추출
            const codeValue = typeof stockCode === 'object' ? stockCode.stockCode : stockCode;
            const result = await fetchFinancialMetrics(codeValue, "2023");
            setRealFinancials(result);
            setLoading(false);
        };
        loadData();
    }, [stockCode]);

    const formatMoney = (v?: number) => {
        if (v == null) return '-';
        const trillion = 1_0000_0000_0000;
        const hundredMillion = 1_0000_0000;
        if (Math.abs(v) >= trillion) return `${(v / trillion).toFixed(1)}조원`;
        if (Math.abs(v) >= hundredMillion) return `${(v / hundredMillion).toFixed(1)}억원`;
        return `${v.toLocaleString()}원`;
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[#1e1e1e] font-bold text-lg">실시간 재무 지표 (DART)</h3>
                    {realFinancials?.reportLink && (
                        <a href={realFinancials.reportLink} target="_blank" className="text-xs text-blue-500 underline">
                            원문 보고서 보기
                        </a>
                    )}
                </div>

                {loading ? (
                    <div>로딩 중...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#f8f9fa] rounded-xl">
                        <MetricBox title="매출액" value={formatMoney(realFinancials?.revenue)} color="#1e1e1e" />
                        <MetricBox title="영업이익" value={formatMoney(realFinancials?.profit)} color="#00b050" />
                        <MetricBox title="당기순이익" value={formatMoney(realFinancials?.netProfit)} color="#1e1e1e" />
                        <MetricBox title="부채비율" value={`${realFinancials?.debtRatio.toFixed(2)}%`} color="#e91e63" />
                    </div>
                )}
            </div>
            {/* 공시 목록 섹션은 기존 코드 유지 */}
        </div>
    );
}

function MetricBox({ title, value, color }: { title: string, value: string, color: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-gray-500 text-xs">{title}</span>
            <span className="font-bold" style={{ color }}>{value}</span>
        </div>
    );
}
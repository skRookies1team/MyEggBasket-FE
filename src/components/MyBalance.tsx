// src/components/MyBalance.tsx
import { useEffect, useState } from 'react';
import { fetchAccountBalance, getAccessToken } from '../api/stockApi';
import type { AccountBalanceData } from '../types/stock';

export default function MyBalance() {
    const [balance, setBalance] = useState<AccountBalanceData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBalance = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            if (!token) throw new Error('토큰 발급 실패');

            const data = await fetchAccountBalance(token);
            if (data) {
                setBalance(data);
            } else {
                setError('데이터를 불러오지 못했습니다.');
            }
        } catch (err) {
            setError('잔고 조회 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBalance();
    }, []);

    if (loading) return <div className="p-8 text-center">자산 정보를 불러오는 중...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error} <button onClick={loadBalance} className="underline ml-2">재시도</button></div>;
    if (!balance) return null;

    const { summary, holdings } = balance;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* 상단 자산 요약 카드 */}
            <div className="bg-white rounded-2xl border border-[#e0e0e0] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#1e1e1e]">내 자산 현황</h2>
                    <button onClick={loadBalance} className="text-sm text-[#4f378a] hover:underline">새로고침</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="text-sm text-gray-500">총 자산</div>
                        <div className="text-lg font-bold">{summary.tot_evlu_amt.toLocaleString()}원</div>
                    </div>
                    <div className="p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="text-sm text-gray-500">예수금 (주문가능)</div>
                        <div className="text-lg font-bold text-[#4f378a]">{summary.dnca_tot_amt.toLocaleString()}원</div>
                    </div>
                    <div className="p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="text-sm text-gray-500">주식 평가금액</div>
                        <div className="text-lg font-bold">{summary.scts_evlu_amt.toLocaleString()}원</div>
                    </div>
                    <div className="p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="text-sm text-gray-500">손익 합계</div>
                        <div className={`text-lg font-bold ${summary.evlu_pfls_smtl_amt >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                            {summary.evlu_pfls_smtl_amt > 0 ? '+' : ''}{summary.evlu_pfls_smtl_amt.toLocaleString()}원
                        </div>
                    </div>
                </div>
            </div>

            {/* 보유 종목 리스트 */}
            <div className="bg-white rounded-2xl border border-[#e0e0e0] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#1e1e1e] mb-4">보유 종목 ({holdings.length})</h3>
                {holdings.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">보유 중인 종목이 없습니다.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f5f5f5] text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">종목명</th>
                                <th className="px-4 py-3 text-right">보유수량</th>
                                <th className="px-4 py-3 text-right">매입가</th>
                                <th className="px-4 py-3 text-right">현재가</th>
                                <th className="px-4 py-3 text-right">평가금액</th>
                                <th className="px-4 py-3 text-right rounded-tr-lg">수익률</th>
                            </tr>
                            </thead>
                            <tbody>
                            {holdings.map((stock) => (
                                <tr key={stock.pdno} className="border-b border-gray-100 last:border-0 hover:bg-[#fafafa] transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        <div>{stock.prdt_name}</div>
                                        <div className="text-xs text-gray-400">{stock.pdno}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right">{stock.hldg_qty.toLocaleString()}주</td>
                                    <td className="px-4 py-3 text-right">{stock.pchs_avg_pric.toLocaleString()}원</td>
                                    <td className="px-4 py-3 text-right">{stock.prpr.toLocaleString()}원</td>
                                    <td className="px-4 py-3 text-right font-medium">{stock.evlu_amt.toLocaleString()}원</td>
                                    <td className={`px-4 py-3 text-right font-bold ${stock.evlu_pfls_rt >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                        {stock.evlu_pfls_rt > 0 ? '+' : ''}{stock.evlu_pfls_rt.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
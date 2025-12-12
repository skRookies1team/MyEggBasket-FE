import { DollarSign } from 'lucide-react';
import type { AccountBalanceData } from '../../types/stock'; 

interface AssetSummaryProps {
    balanceData: AccountBalanceData | null;
    loading: boolean;
}

export function AssetSummary({ balanceData, loading }: AssetSummaryProps) { // ✅ Prop 사용
    const positiveColor = '#ff383c';
    const negativeColor = '#0066ff';
    
    // Prop으로 받은 데이터의 summary 부분 사용
    const summary = balanceData?.summary;

    const stockEvaluationAmount = (summary?.totalEvaluationAmount ?? 0) - (summary?.cashAmount ?? 0);
    // AccountSummary 타입(stock.ts)에 맞춰 totalProfitLossAmount 사용
    const totalProfitLoss = summary?.totalProfitLossAmount ?? 0; 
    const profitRate = summary?.profitRate ?? 0;

    return (
        <div className="section-card">
            <div className="section-header">
                <DollarSign className="size-5 text-purple" />
                <h2 className="section-title">내 자산 현황</h2>
            </div>

            <div className="summary-grid">
                {/* 1. 총 자산 */}
                <div className="summary-item bg-purple-light">
                    <p className="summary-label">총 자산</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${(summary?.totalEvaluationAmount ?? 0).toLocaleString()}`}
                    </p>
                </div>

                {/* 2. 총 수익 / 수익률 */}
                <div className="summary-item bg-green-light">
                    <p className="summary-label">총 수익 / 수익률</p>
                    <div className="summary-value" style={{ color: totalProfitLoss >= 0 ? positiveColor : negativeColor }}>
                        {loading ? '-' : (
                            <>
                                {totalProfitLoss > 0 ? '+' : ''}{totalProfitLoss.toLocaleString()}
                                <span style={{ fontSize: '16px', marginLeft: '6px', fontWeight: 500 }}>
                                    ({profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%)
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. 주식 평가금액 (총자산 - 예수금) */}
                <div className="summary-item bg-gray-light">
                    <p className="summary-label">주식 평가금액</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${stockEvaluationAmount.toLocaleString()}`}
                    </p>
                </div>

                {/* 4. 예수금 (주문가능) */}
                <div className="summary-item bg-gray-light">
                    <p className="summary-label">예수금 (주문가능)</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${summary?.cashAmount.toLocaleString() ?? 0}`}
                    </p>
                    {/* D+1, D+2 예수금은 현재 타입 정의에 없으므로 임시로 cashAmount를 사용하거나, summary에 필드가 추가될 경우 그 값을 사용하도록 준비 */}
                    <p className="summary-label">D+1 예수금</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${summary?.cashAmount.toLocaleString() ?? 0}`}
                    </p>
                    <p className="summary-label">D+2 예수금</p>
                    <p className="summary-value">
                        {loading ? '-' : `₩${summary?.cashAmount.toLocaleString() ?? 0}`}
                    </p>
                </div>
            </div>
        </div>
    );
}